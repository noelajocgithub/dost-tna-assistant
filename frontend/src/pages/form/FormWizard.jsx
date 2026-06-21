import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { formsApi } from '../../api/forms'
import { aiApi } from '../../api/ai'
import { useAuthStore } from '../../store/authStore'
import { STEPS } from '../../components/form/steps'
import ReviewSubmit from '../../components/form/steps/ReviewSubmit'
import { formatDateTime } from '../../utils/format'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import AIAssistButton from '../../components/ai/AIAssistButton'
import AIAssistPanel from '../../components/ai/AIAssistPanel'
import ExportButtons from '../../components/form/ExportButtons'

// Friendly per-field instructions for the AI prompt; falls back to a generic one.
const FIELD_INSTRUCTIONS = {
  business_background: 'Write a concise 3-paragraph business background.',
  products_services: 'Describe the products and services offered in 1-2 paragraphs.',
  reason_for_assistance: 'Draft a clear statement of why the enterprise needs DOST assistance.',
  organizational_structure: 'Describe the enterprise\'s organizational structure, key roles, and reporting relationships.',
  five_year_plan: 'Write a realistic 5-year business plan summary.',
  ten_year_plan: 'Write a realistic 10-year business plan summary.',
  vision_mission_values: 'Draft a vision statement, mission statement, and 3-5 core values.',
  production_problems: 'Summarize likely production problems based on the equipment and context.',
  waste_management: 'Describe a practical waste management approach.',
  production_plan: 'Describe the enterprise\'s production system.',
  production_planning_control: 'Describe the enterprise\'s production planning and control practices.',
  work_study_improvement: 'Describe work study and process improvement practices.',
  quality_assurance_system: 'Describe the quality assurance system in place.',
  product_process_performance: 'Describe product and process performance monitoring and improvement.',
  process_flow: 'Describe the production process flow step by step.',
  gmp_haccp_details: 'Describe the enterprise\'s GMP/HACCP activities and food-safety practices.',
  inventory_system: 'Describe an appropriate inventory system.',
  maintenance_program: 'Describe an equipment maintenance program.',
  purchasing_system: 'Describe a purchasing and supplies management system.',
  marketing_plan: 'Write a concise marketing plan.',
  promotional_strategies: 'Suggest promotional strategies suited to this enterprise.',
  market_competitors: 'Summarize the likely competitive landscape.',
  cash_flow: 'Summarize the cash flow / financial position narrative.',
  capital_sources: 'Describe the enterprise\'s sources of capital and credit.',
  accounting_system: 'Describe an appropriate accounting system.',
  hiring_criteria: 'Draft hiring criteria for key roles.',
  incentives: 'Suggest employee incentive practices.',
  training_development: 'Describe training and development programs for employees.',
  safety_measures: 'Describe workplace safety measures.',
  employee_welfare: 'Describe other employee welfare programs and benefits.',
  other_concerns: 'Summarize any other relevant concerns for this enterprise.',
}

const REVIEW_INDEX = STEPS.length // step 9

export default function FormWizard() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [status, setStatus] = useState('draft')
  const [enterpriseName, setEnterpriseName] = useState('')
  const [returnReason, setReturnReason] = useState(null)
  const [sectionsData, setSectionsData] = useState({})
  const [attachments, setAttachments] = useState([])
  const [step, setStep] = useState(0)
  const [saveState, setSaveState] = useState('idle') // idle|saving|saved|error
  const [lastSaved, setLastSaved] = useState(null)
  const [signature, setSignature] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ai, setAi] = useState({
    open: false,
    field: null,
    section: null,
    loading: false,
    result: '',
    error: '',
    instruction: '',
  })
  // Prompt instructions (admin-managed defaults), with the built-in map as fallback.
  const [prompts, setPrompts] = useState(FIELD_INSTRUCTIONS)

  useEffect(() => {
    aiApi
      .prompts()
      .then((map) => setPrompts((prev) => ({ ...prev, ...map })))
      .catch(() => {})
  }, [])

  const timers = useRef({})
  const pending = useRef({})

  // Provincial staff may edit forms in their province at any status;
  // owners can edit only while a form is a draft or has been returned.
  // Opening with ?mode=view forces read-only regardless of role/status.
  const [searchParams] = useSearchParams()
  const viewOnly = searchParams.get('mode') === 'view'
  const role = useAuthStore((s) => s.user?.role)
  const canEditAnyStatus =
    role === 'provincial_staff' || role === 'provincial_director'
  const editable =
    !viewOnly &&
    (canEditAnyStatus || status === 'draft' || status === 'returned')

  useEffect(() => {
    formsApi
      .get(id)
      .then((res) => {
        setStatus(res.form.status)
        setEnterpriseName(res.form.enterprise_name || '')
        setReturnReason(res.form.return_reason)
        setSectionsData(res.sections || {})
        setAttachments(res.attachments || [])
        setLastSaved(res.form.updated_at)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const doSave = useCallback(
    async (sectionKey) => {
      const data = pending.current[sectionKey]
      if (!data) return
      setSaveState('saving')
      try {
        const r = await formsApi.saveSection(id, sectionKey, data)
        delete pending.current[sectionKey]
        setSaveState('saved')
        setLastSaved(r.updated_at)
      } catch {
        setSaveState('error')
      }
    },
    [id],
  )

  function scheduleSave(sectionKey, data) {
    pending.current[sectionKey] = data
    clearTimeout(timers.current[sectionKey])
    timers.current[sectionKey] = setTimeout(() => doSave(sectionKey), 800)
  }

  // Flush all pending saves immediately (on navigation / unmount).
  const flush = useCallback(async () => {
    const keys = Object.keys(pending.current)
    keys.forEach((k) => clearTimeout(timers.current[k]))
    await Promise.all(keys.map((k) => doSave(k)))
  }, [doSave])

  useEffect(() => () => flush(), [flush])

  function makeUpdater(sectionKey) {
    return (name, value) => {
      setSectionsData((prev) => {
        const nextSection = { ...(prev[sectionKey] || {}), [name]: value }
        const next = { ...prev, [sectionKey]: nextSection }
        scheduleSave(sectionKey, nextSection)
        return next
      })
      if (sectionKey === 'enterprise_info' && name === 'enterprise_name') {
        setEnterpriseName(value)
      }
    }
  }

  // Attachment helpers: keep one record per type in local state.
  function handleAttachmentUploaded(record) {
    setAttachments((prev) => [
      ...prev.filter((a) => a.type !== record.type),
      record,
    ])
  }
  function handleAttachmentRemoved(attachmentId) {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
  }

  async function goToStep(target) {
    await flush()
    setStep(target)
    window.scrollTo({ top: 0 })
  }

  async function runAI(sectionKey, field, instructionOverride) {
    const instruction =
      instructionOverride ??
      prompts[field] ??
      `Write the "${field.replace(/_/g, ' ')}" narrative for a DOST TNA form.`
    setAi({
      open: true,
      field,
      section: sectionKey,
      loading: true,
      result: '',
      error: '',
      instruction,
    })
    // Feed every completed step into the context so the AI can cross-reference
    // data entered elsewhere. Current step is merged last so its values win.
    const hasData = (d) =>
      d &&
      Object.values(d).some((v) =>
        Array.isArray(v) ? v.length : v !== '' && v != null,
      )
    const context = { ...(sectionsData.enterprise_info || {}) }
    for (const s of STEPS) {
      if (hasData(sectionsData[s.key])) Object.assign(context, sectionsData[s.key])
    }
    Object.assign(context, sectionsData[sectionKey] || {})
    try {
      const { text } = await aiApi.assist(field, context, instruction)
      setAi((a) => ({ ...a, loading: false, result: text }))
    } catch (err) {
      setAi((a) => ({
        ...a,
        loading: false,
        error: err.response?.data?.message || 'AI generation failed.',
      }))
    }
  }

  function useSuggestion() {
    if (ai.section && ai.field) {
      makeUpdater(ai.section)(ai.field, ai.result)
    }
    setAi((a) => ({ ...a, open: false }))
  }

  // Slot passed to step components: renders an AI Assist button per narrative field.
  function aiSlot(field) {
    if (!editable) return null
    return <AIAssistButton onClick={() => runAI(active.key, field)} />
  }

  async function handleSubmit() {
    await flush()
    setSubmitting(true)
    try {
      const updated = await formsApi.submit(id)
      setStatus(updated.status)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>
  if (notFound) return <div className="text-sm text-red-600">Form not found.</div>

  const onReview = step === REVIEW_INDEX
  const totalSteps = STEPS.length + 1
  const completedCount = STEPS.filter((s) => {
    const d = sectionsData[s.key]
    return d && Object.values(d).some((v) => (Array.isArray(v) ? v.length : v))
  }).length
  const progress = Math.round((completedCount / STEPS.length) * 100)

  const active = STEPS[step]
  const StepComponent = active?.Component
  const canSubmit = Boolean(enterpriseName) && editable

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={async () => {
            await flush()
            navigate('/dashboard')
          }}
        >
          ← Back to Dashboard
        </Button>
        <StatusBadge status={status} />
      </div>

      {status === 'returned' && returnReason && (
        <div className="border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">
          <span className="font-medium">Returned by evaluator:</span> {returnReason}
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium text-charcoal">
            Step {step + 1} of {totalSteps} —{' '}
            {onReview ? 'Review & Submit' : active.title}
          </span>
          <span className="text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-neutral h-1.5">
          <div
            className="bg-cyan h-1.5 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-neutral pb-1">
        {STEPS.map((s, i) => {
          const d = sectionsData[s.key]
          const done = d && Object.values(d).some((v) => (Array.isArray(v) ? v.length : v))
          const isCurrent = i === step
          return (
            <button
              key={s.key}
              onClick={() => goToStep(i)}
              className={`flex items-center gap-1 text-sm py-1.5 ${
                isCurrent
                  ? 'border-b-2 border-primary text-primary font-medium'
                  : done
                    ? 'text-charcoal'
                    : 'text-gray-400'
              }`}
            >
              {done && <Check size={13} strokeWidth={2} className="text-green" />}
              {s.tab}
            </button>
          )
        })}
        <button
          onClick={() => goToStep(REVIEW_INDEX)}
          className={`text-sm py-1.5 ${
            onReview
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-400'
          }`}
        >
          Review
        </button>
      </div>

      {/* Step content */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-charcoal">
            {onReview ? 'Step 9 — Review & Submit' : `Step ${step + 1} — ${active.title}`}
          </h2>
        </div>
        <p className="text-xs mb-6">
          {!editable ? (
            <span className="text-gray-500">Read-only ({status.replace('_', ' ')})</span>
          ) : saveState === 'saving' ? (
            <span className="text-cyan">Saving…</span>
          ) : saveState === 'error' ? (
            <span className="text-red-600">⚠ Save failed</span>
          ) : (
            <span className="text-green">
              ✓ Saved{lastSaved ? ` · ${formatDateTime(lastSaved)}` : ''}
            </span>
          )}
        </p>
        <hr className="border-t border-neutral mb-6" />

        {onReview ? (
          <>
          <div className="flex justify-end mb-4">
            <ExportButtons formId={id} />
          </div>
          <ReviewSubmit
            sectionsData={sectionsData}
            enterpriseName={enterpriseName}
            signature={signature}
            onSignatureChange={setSignature}
            onSubmit={handleSubmit}
            submitting={submitting}
            canSubmit={canSubmit && Boolean(signature.trim())}
          />
          </>
        ) : (
          <fieldset disabled={!editable} className={!editable ? 'opacity-70' : ''}>
            <StepComponent
              value={sectionsData[active.key] || {}}
              onChange={makeUpdater(active.key)}
              aiSlot={aiSlot}
              formId={id}
              editable={editable}
              attachments={attachments}
              onAttachmentUploaded={handleAttachmentUploaded}
              onAttachmentRemoved={handleAttachmentRemoved}
            />
          </fieldset>
        )}
      </Card>

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => goToStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {onReview ? null : (
          <Button onClick={() => goToStep(step + 1)}>
            {step === STEPS.length - 1 ? 'Go to Review' : 'Next'}
          </Button>
        )}
      </div>

      <AIAssistPanel
        open={ai.open}
        field={ai.field}
        loading={ai.loading}
        result={ai.result}
        error={ai.error}
        instruction={ai.instruction}
        onInstructionChange={(v) => setAi((a) => ({ ...a, instruction: v }))}
        onClose={() => setAi((a) => ({ ...a, open: false }))}
        onUse={useSuggestion}
        onRegenerate={() => runAI(ai.section, ai.field, ai.instruction)}
      />
    </div>
  )
}
