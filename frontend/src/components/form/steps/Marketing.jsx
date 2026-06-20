import { TextField, TextAreaField, YesNo, IntegerField, FieldGrid } from '../Field'

export default function Marketing({ value, onChange, aiSlot }) {
  const p = { value, onChange }
  return (
    <div className="space-y-6">
      <TextAreaField label="Marketing Plan" name="marketing_plan" header={aiSlot?.('marketing_plan')} {...p} />

      <FieldGrid>
        <TextField label="Market Outlets" name="market_outlets" {...p} />
        <IntegerField label="Number of Outlets" name="number_of_outlets" {...p} />
      </FieldGrid>

      <TextAreaField label="Promotional Strategies" name="promotional_strategies" header={aiSlot?.('promotional_strategies')} {...p} />
      <TextAreaField label="Market Competitors" name="market_competitors" header={aiSlot?.('market_competitors')} {...p} />

      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-2">Packaging</h3>
        <div className="space-y-4">
          <YesNo label="Nutrition Evaluation" name="pkg_nutrition" {...p} />
          <YesNo label="Bar Code" name="pkg_barcode" {...p} />
          <YesNo label="Product Label" name="pkg_label" {...p} />
          <YesNo label="Expiry Date" name="pkg_expiry" {...p} />
        </div>
      </div>
    </div>
  )
}
