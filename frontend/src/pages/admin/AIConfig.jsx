import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { adminApi } from '../../api/admin'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'

// API sources (cloud providers) and their selectable models.
const PROVIDERS = [
  {
    value: 'claude',
    label: 'Claude (Anthropic)',
    cloud: true,
    models: ['claude-haiku-3-5', 'claude-3-5-sonnet-latest', 'claude-3-opus-latest'],
  },
  {
    value: 'gemini',
    label: 'Gemini (Google)',
    cloud: true,
    models: ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-pro'],
  },
  {
    value: 'openai',
    label: 'OpenAI',
    cloud: true,
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  },
  {
    value: 'qwen',
    label: 'Qwen (Alibaba)',
    cloud: true,
    models: ['qwen-flash', 'qwen-plus', 'qwen-max'],
  },
  {
    value: 'ollama',
    label: 'Ollama — Local (No API key required)',
    cloud: false,
    models: [],
  },
]

const CUSTOM = '__custom__'

export default function AIConfig() {
  const [configs, setConfigs] = useState([])
  const [provider, setProvider] = useState('ollama')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [modelName, setModelName] = useState('')
  const [customModel, setCustomModel] = useState(false)
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('llama3.1')
  const [ollamaModels, setOllamaModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const meta = PROVIDERS.find((p) => p.value === provider)

  useEffect(() => {
    adminApi.getAiConfig().then((data) => {
      setConfigs(data.configs)
      if (data.active) setProvider(data.active)
      setLoaded(true)
    })
  }, [])

  // When provider changes, prefill from the stored config (if any).
  useEffect(() => {
    if (!loaded) return
    const existing = configs.find((c) => c.provider === provider)
    const m = PROVIDERS.find((p) => p.value === provider)
    setApiKey('')
    setTestResult(null)
    const model = existing?.model_name || m?.models?.[0] || ''
    setModelName(model)
    setCustomModel(m?.cloud && model && !m.models.includes(model))
    setOllamaUrl(existing?.ollama_base_url || 'http://localhost:11434')
    setOllamaModel(existing?.ollama_model || 'llama3.1')
  }, [provider, loaded, configs])

  // Fetch live Ollama models whenever the local provider/base URL is in play.
  const fetchOllamaModels = useCallback(
    (url) => {
      setLoadingModels(true)
      setModelsError('')
      adminApi
        .ollamaModels(url)
        .then((r) => {
          setOllamaModels(r.models || [])
          if (!r.ok) setModelsError(r.message || 'Could not reach Ollama.')
        })
        .catch((err) => {
          setOllamaModels([])
          setModelsError(err.response?.data?.message || 'Could not reach Ollama.')
        })
        .finally(() => setLoadingModels(false))
    },
    [],
  )

  useEffect(() => {
    if (loaded && provider === 'ollama') fetchOllamaModels(ollamaUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, loaded])

  function payload() {
    const base = { provider }
    if (meta.cloud) {
      if (apiKey) base.api_key = apiKey
      base.model_name = modelName
    } else {
      base.ollama_base_url = ollamaUrl
      base.ollama_model = ollamaModel
    }
    return base
  }

  async function test() {
    setTesting(true)
    setTestResult(null)
    try {
      const r = await adminApi.testAiConfig(payload())
      setTestResult({ ok: r.ok, message: r.message })
    } catch (err) {
      setTestResult({
        ok: false,
        message: err.response?.data?.message || 'Connection failed.',
      })
    } finally {
      setTesting(false)
    }
  }

  async function save() {
    setSaving(true)
    try {
      await adminApi.saveAiConfig({ ...payload(), set_active: true })
      const data = await adminApi.getAiConfig()
      setConfigs(data.configs)
      setTestResult({ ok: true, message: 'Configuration saved and set active.' })
    } finally {
      setSaving(false)
    }
  }

  const existing = configs.find((c) => c.provider === provider)
  // Ensure the currently-selected ollama model always appears in the dropdown.
  const ollamaOptions = ollamaModels.includes(ollamaModel) || !ollamaModel
    ? ollamaModels
    : [ollamaModel, ...ollamaModels]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">AI Configuration</h1>

      <Card className="p-6 max-w-2xl space-y-6">
        {/* API source selector */}
        <Select
          label="API Source / Provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>

        {meta.cloud ? (
          <div className="border border-neutral p-4 space-y-4">
            <h3 className="text-sm font-semibold text-charcoal">
              {meta.label.split(' (')[0]} Settings
            </h3>

            {/* API key for the selected source */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                API Key{' '}
                {existing?.has_api_key && (
                  <span className="text-xs text-green">(key on file)</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    existing?.has_api_key
                      ? '•••••••• (leave blank to keep)'
                      : 'Enter API key'
                  }
                  className="glass-input flex-1 text-charcoal text-sm px-3 py-2 rounded-lg"
                />
                <Button variant="secondary" onClick={() => setShowKey((v) => !v)}>
                  {showKey ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>

            {/* Model selector for the selected source */}
            <Select
              label="Model"
              value={customModel ? CUSTOM : modelName}
              onChange={(e) => {
                if (e.target.value === CUSTOM) {
                  setCustomModel(true)
                  setModelName('')
                } else {
                  setCustomModel(false)
                  setModelName(e.target.value)
                }
              }}
            >
              {meta.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value={CUSTOM}>Custom…</option>
            </Select>
            {customModel && (
              <Input
                label="Custom model name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. gpt-4.1"
              />
            )}
          </div>
        ) : (
          <div className="border border-neutral p-4 space-y-4">
            <h3 className="text-sm font-semibold text-charcoal">
              Ollama Settings (local — no API key)
            </h3>
            <div className="flex items-end gap-2">
              <Input
                label="Base URL"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={() => fetchOllamaModels(ollamaUrl)}
                disabled={loadingModels}
              >
                <span className="flex items-center gap-1.5">
                  <RefreshCw
                    size={14}
                    strokeWidth={1.5}
                    className={loadingModels ? 'animate-spin' : ''}
                  />
                  Refresh
                </span>
              </Button>
            </div>

            {/* Live local-model selector */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Local Model
              </label>
              {ollamaOptions.length > 0 ? (
                <Select
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                >
                  {ollamaOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="e.g. llama3.1:8b"
                />
              )}
              {loadingModels ? (
                <p className="text-xs text-cyan mt-1">Loading installed models…</p>
              ) : modelsError ? (
                <p className="text-xs text-red-500 mt-1">
                  {modelsError} — enter a model name manually.
                </p>
              ) : (
                <p className="text-xs text-muted mt-1">
                  {ollamaModels.length} model(s) found on this server.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button variant="accent" onClick={test} disabled={testing}>
            {testing ? 'Testing…' : 'Test Connection'}
          </Button>
          {testResult && (
            <span
              className={`text-sm ${testResult.ok ? 'text-green' : 'text-red-500'}`}
            >
              {testResult.ok ? '✓ ' : '⚠ '}
              {testResult.message}
            </span>
          )}
        </div>

        <div className="border-t border-neutral pt-4">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Configuration'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
