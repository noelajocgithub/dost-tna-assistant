import { useState } from 'react'
import { Download } from 'lucide-react'
import { formsApi } from '../../api/forms'

// Download PDF / DOCX for a form (auth via the axios client).
export default function ExportButtons({ formId }) {
  const [busy, setBusy] = useState(null)

  async function download(format) {
    setBusy(format)
    try {
      await formsApi.download(formId, format)
    } catch {
      alert('Download failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => download('pdf')}
        disabled={busy}
        className="flex items-center gap-1.5 border border-primary text-primary text-sm px-4 py-2 hover:bg-neutral disabled:opacity-50"
      >
        <Download size={15} strokeWidth={1.5} />
        {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
      </button>
      <button
        onClick={() => download('docx')}
        disabled={busy}
        className="flex items-center gap-1.5 border border-primary text-primary text-sm px-4 py-2 hover:bg-neutral disabled:opacity-50"
      >
        <Download size={15} strokeWidth={1.5} />
        {busy === 'docx' ? 'Preparing…' : 'Download DOCX'}
      </button>
    </div>
  )
}
