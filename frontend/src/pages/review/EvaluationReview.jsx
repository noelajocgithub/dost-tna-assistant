import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, Check } from 'lucide-react'
import { evaluationsApi } from '../../api/evaluations'
import { aiApi } from '../../api/ai'
import { useAuthStore } from '../../store/authStore'
import { EVALUATION_ACTIONS, ACTION_BY_VALUE } from '../../constants/evaluation'
import { formatDate } from '../../utils/format'
import { humanizeKey } from '../../utils/labels'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import ExportButtons from '../../components/form/ExportButtons'
import AIAssistButton from '../../components/ai/AIAssistButton'
import AIAssistPanel from '../../components/ai/AIAssistPanel'

// Read-only rendering of a section's data object.
function SectionValues({ data }) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) {
    return <p className="text-sm text-muted italic">No data entered.</p>
  }
  return (
    <div className="space-y-2">
      {entries.map(([k, v]) =>
        Array.isArray(v) ? (
          <div key={k}>
            <p className="text-xs text-muted mb-1">{humanizeKey(k)}</p>
            {v.length === 0 ? (
              <p className="text-sm text-muted italic">empty</p>
            ) : (
              <div className="border border-white/10 overflow-x-auto rounded-lg">
                <table className="w-full text-sm">
                  <tbody>
                    {v.map((row, i) => (
                      <tr key={i} className="border-b border-white/30">
                        {Object.values(row).map((cell, j) => (
                          <td key={j} className="px-2 py-1 text-charcoal">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div key={k} className="grid grid-cols-3 gap-2 text-sm border-b border-white/30 py-1">
            <span className="text-muted">{humanizeKey(k)}</span>
            <span className="col-span-2 text-charcoal whitespace-pre-wrap break-words">
              {String(v)}
            </span>
          </div>
        ),
      )}
    </div>
  )
}

// A wrapped group of the 4 decision options.
function DecisionButtons({ value, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {EVALUATION_ACTIONS.map((a) => {
        const active = value === a.value
        return (
          <button
            key={a.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(a.value)}
            className={`text-sm px-3 py-1.5 border rounded-lg transition-colors disabled:opacity-50 ${
              active
                ? a.selected
                : `bg-white/10 text-charcoal ${a.border} ${a.hover}`
            }`}
          >
            {a.label}
          </button>
        )
      })}
    </div>
  )
}

export default function EvaluationReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Edit mode is explicit (?mode=edit); anything else is read-only.
  // In edit mode the evaluator can change comments/decisions even after the
  // form has been validated or returned.
  // The regional director can only ever view (never evaluate).
  const isOverseer = useAuthStore((s) => s.user?.role) === 'regional_director'
  const editMode = searchParams.get('mode') === 'edit' && !isOverseer
  const readOnly = !editMode

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState({})
  const [comments, setComments] = useState({})
  const [evals, setEvals] = useState({})
  const [savingKey, setSavingKey] = useState(null)

  // Overall evaluation state
  const [overallComment, setOverallComment] = useState('')
  const [overallAction, setOverallAction] = useState(null)
  const [busy, setBusy] = useState(false)

  // AI Assist for drafting evaluator comments (local model via /api/ai/assist).
  const [ai, setAi] = useState({
    open: false,
    target: null, // { type:'section', key } | { type:'overall' }
    field: '',
    loading: false,
    result: '',
    error: '',
    instruction: '',
  })
  // Admin-managed prompt templates for evaluator comments.
  const [prompts, setPrompts] = useState({})

  useEffect(() => {
    aiApi
      .prompts()
      .then(setPrompts)
      .catch(() => {})
  }, [])

  useEffect(() => {
    evaluationsApi
      .get(id, editMode ? 'edit' : 'view')
      .then((res) => {
        setData(res)
        setEvals(res.evaluations || {})
        const seed = {}
        Object.entries(res.evaluations || {}).forEach(([k, v]) => {
          seed[k] = v.comment || ''
        })
        setComments(seed)
        setOverallComment(res.form.overall_comment || '')
        setOverallAction(res.form.overall_action || null)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function saveSection(sectionKey, action) {
    setSavingKey(sectionKey)
    try {
      const r = await evaluationsApi.comment(
        id,
        sectionKey,
        comments[sectionKey] || '',
        action,
      )
      setEvals((e) => ({ ...e, [sectionKey]: { comment: r.comment, action: r.action } }))
    } finally {
      setSavingKey(null)
    }
  }

  async function submitOverall() {
    if (!overallAction) return
    setBusy(true)
    try {
      await evaluationsApi.overall(id, overallAction, overallComment)
      navigate('/evaluate')
    } finally {
      setBusy(false)
    }
  }

  async function runAI(target, instructionOverride) {
    const d = data
    let field
    let context
    let instruction
    if (target.type === 'section') {
      field = `evaluator_comment_${target.key}`
      context = d.sections[target.key] || {}
      const tmpl =
        prompts.eval_section_comment ||
        'You are a DOST regional evaluator reviewing the "{section}" section of an MSME TNA Form 01. Based on the applicant\'s data, draft a concise, professional evaluator comment (2-4 sentences) noting strengths, gaps, or compliance concerns. Return only the comment text.'
      instruction =
        instructionOverride ?? tmpl.replaceAll('{section}', d.section_titles[target.key])
    } else {
      field = 'overall_evaluation_comment'
      context = {
        enterprise: d.form.enterprise_name,
        section_decisions: d.evaluations,
      }
      instruction =
        instructionOverride ??
        prompts.eval_overall_comment ??
        'You are a DOST regional evaluator. Draft a concise overall evaluation summary comment (3-5 sentences) for this TNA based on the section decisions and applicant data. Return only the comment text.'
    }
    setAi({ open: true, target, field, loading: true, result: '', error: '', instruction })
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
    const t = ai.target
    if (t?.type === 'section') {
      setComments((c) => ({ ...c, [t.key]: ai.result }))
    } else if (t?.type === 'overall') {
      setOverallComment(ai.result)
    }
    setAi((a) => ({ ...a, open: false }))
  }

  if (loading) return <div className="text-sm text-muted">Loading…</div>
  if (!data) return <div className="text-sm text-red-500">Form not found.</div>

  const { form, sections, section_keys, section_titles } = data

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/evaluate')}>
          ← Back to Queue
        </Button>
        <ExportButtons formId={id} />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">
              {form.enterprise_name || 'Untitled'}
            </h1>
            <p className="text-sm text-muted mt-1">
              {form.province} · Submitted by {form.submitted_by} ·{' '}
              {formatDate(form.submitted_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                readOnly
                  ? 'bg-white/10 text-charcoal border-white/15'
                  : 'bg-cyan text-white border-cyan'
              }`}
            >
              {readOnly ? 'View only' : 'Editing'}
            </span>
            <StatusBadge status={form.status} />
          </div>
        </div>
      </Card>

      {/* Per-section evaluations */}
      {section_keys.map((key) => {
        const ev = evals[key]
        const isOpen = open[key]
        const decided = ev?.action ? ACTION_BY_VALUE[ev.action] : null
        return (
          <Card key={key}>
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 rounded-t-2xl"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                {isOpen ? (
                  <ChevronDown size={16} strokeWidth={1.5} />
                ) : (
                  <ChevronRight size={16} strokeWidth={1.5} />
                )}
                {section_titles[key]}
              </span>
              {decided && (
                <span className={`text-xs font-medium ${decided.text}`}>
                  {decided.short}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="px-6 pb-6 border-t border-white/30 pt-4 space-y-4">
                <SectionValues data={sections[key]} />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-charcoal">
                      Evaluator Comment
                    </label>
                    {!readOnly && (
                      <AIAssistButton
                        onClick={() => runAI({ type: 'section', key })}
                      />
                    )}
                  </div>
                  <Textarea
                    value={comments[key] || ''}
                    onChange={(e) =>
                      setComments((c) => ({ ...c, [key]: e.target.value }))
                    }
                    disabled={readOnly}
                    rows={2}
                  />
                </div>

                {!readOnly && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-charcoal">
                      Decision
                    </label>
                    <DecisionButtons
                      value={ev?.action}
                      onSelect={(action) => saveSection(key, action)}
                      disabled={savingKey === key}
                    />
                    {savingKey === key && (
                      <p className="text-xs text-cyan">Saving…</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}

      {/* Overall evaluation */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Check size={18} strokeWidth={1.5} className="text-primary" />
          <h2 className="text-lg font-semibold text-charcoal">
            Overall Evaluation
          </h2>
        </div>
        <p className="text-sm text-muted">
          Record the overall decision for this TNA. Approving endorses the form;
          requesting clarification or marking non-compliant returns it to the
          submitter.
        </p>

        {readOnly ? (
          <div className="border border-white/10 rounded-lg p-4 bg-white/5">
            <p className="text-sm">
              <span className="text-muted">Decision: </span>
              <span className={`font-medium ${ACTION_BY_VALUE[form.overall_action]?.text || 'text-charcoal'}`}>
                {ACTION_BY_VALUE[form.overall_action]?.label || 'Not yet evaluated'}
              </span>
            </p>
            {form.overall_comment && (
              <p className="text-sm text-charcoal mt-2 whitespace-pre-wrap">
                {form.overall_comment}
              </p>
            )}
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-charcoal">
                  Overall Comment
                </label>
                <AIAssistButton onClick={() => runAI({ type: 'overall' })} />
              </div>
              <Textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                rows={3}
                placeholder="Summary feedback for the submitter…"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">
                Overall Decision
              </label>
              <DecisionButtons value={overallAction} onSelect={setOverallAction} />
            </div>
            <div className="border-t border-white/30 pt-4">
              <Button onClick={submitOverall} disabled={busy || !overallAction}>
                {busy
                  ? 'Saving…'
                  : form.overall_action
                    ? 'Update Overall Evaluation'
                    : 'Submit Overall Evaluation'}
              </Button>
            </div>
          </>
        )}
      </Card>

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
        onRegenerate={() => runAI(ai.target, ai.instruction)}
      />
    </div>
  )
}
