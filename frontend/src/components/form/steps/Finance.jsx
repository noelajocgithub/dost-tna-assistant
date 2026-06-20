import { TextAreaField } from '../Field'

export default function Finance({ value, onChange, aiSlot }) {
  const p = { value, onChange }
  return (
    <div className="space-y-6">
      <TextAreaField label="Cash Flow / Financial Documents" name="cash_flow" header={aiSlot?.('cash_flow')} {...p} />
      <TextAreaField label="Source(s) of Capital / Credit" name="capital_sources" {...p} />
      <TextAreaField label="Accounting System" name="accounting_system" header={aiSlot?.('accounting_system')} {...p} />
    </div>
  )
}
