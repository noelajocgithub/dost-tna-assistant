import { useEffect, useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { attachmentsApi } from '../../api/attachments'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = 'image/png,image/jpeg'

// Single-image upload bound to a form attachment of a given `type`.
// Stores via the attachments API (not section JSONB); shows a live preview.
export default function ImageUploadField({
  label,
  formId,
  type,
  attachment,
  onUploaded,
  onRemoved,
  disabled,
}) {
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  // Load the stored image as an object URL whenever the attachment changes.
  useEffect(() => {
    let url = null
    let cancelled = false
    if (attachment?.id) {
      attachmentsApi
        .blobUrl(formId, attachment.id)
        .then((u) => {
          if (cancelled) return URL.revokeObjectURL(u)
          url = u
          setPreview(u)
        })
        .catch(() => !cancelled && setError('Could not load image.'))
    } else {
      setPreview(null)
    }
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [formId, attachment?.id])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setError('')
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      return setError('Please choose a PNG or JPG image.')
    }
    if (file.size > MAX_BYTES) {
      return setError('Image must be 5 MB or smaller.')
    }
    setBusy(true)
    try {
      const record = await attachmentsApi.upload(formId, type, file)
      onUploaded?.(record)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    if (!attachment?.id) return
    setBusy(true)
    setError('')
    try {
      await attachmentsApi.remove(formId, attachment.id)
      onRemoved?.(attachment.id)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove image.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-charcoal mb-1">{label}</label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleFile}
        disabled={disabled || busy}
      />

      {preview ? (
        <div className="glass-input rounded-lg p-3 flex flex-col gap-3">
          <img
            src={preview}
            alt={attachment?.original_name || 'Organizational structure'}
            className="max-h-64 w-auto self-start rounded-md border border-white/15"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted truncate">
              {attachment?.original_name}
            </span>
            {!disabled && (
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="text-xs px-2.5 py-1 rounded-lg border border-white/15 bg-white/10 text-charcoal hover:bg-white/10 disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={busy}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/15 disabled:opacity-50"
                >
                  <X size={13} strokeWidth={1.5} /> Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="glass-input w-full rounded-lg px-3 py-8 flex flex-col items-center justify-center gap-2 text-muted hover:text-charcoal disabled:opacity-50"
        >
          {busy ? (
            <span className="text-sm">Uploading…</span>
          ) : (
            <>
              <span className="flex items-center gap-2 text-sm">
                {disabled ? <ImageIcon size={18} strokeWidth={1.5} /> : <Upload size={18} strokeWidth={1.5} />}
                {disabled ? 'No image uploaded' : 'Click to upload an image'}
              </span>
              {!disabled && <span className="text-xs text-muted">PNG or JPG, up to 5 MB</span>}
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
