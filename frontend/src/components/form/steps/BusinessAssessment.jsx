import { TextField, TextAreaField, YesNo, CurrencyField, FieldGrid } from '../Field'

export default function BusinessAssessment({ value, onChange, aiSlot }) {
  const p = { value, onChange }
  const priorConsult = value?.prior_consultations === 'Yes'

  return (
    <div className="space-y-6">
      <TextAreaField
        label="Products / Services Offered"
        name="products_services"
        header={aiSlot?.('products_services')}
        {...p}
      />
      <TextAreaField
        label="Reason for Requesting Assistance"
        name="reason_for_assistance"
        header={aiSlot?.('reason_for_assistance')}
        {...p}
      />

      <YesNo label="Prior Consultations with Other Agencies?" name="prior_consultations" {...p} />
      {priorConsult && (
        <FieldGrid>
          <TextField label="Agency" name="prior_agency" {...p} />
          <TextField label="Type of Assistance" name="prior_type" {...p} />
          <CurrencyField label="Amount (PHP)" name="prior_amount" {...p} />
        </FieldGrid>
      )}

      <TextAreaField label="5-Year Plan" name="five_year_plan" header={aiSlot?.('five_year_plan')} {...p} />
      <TextAreaField label="10-Year Plan" name="ten_year_plan" header={aiSlot?.('ten_year_plan')} {...p} />
      <TextAreaField label="Vision, Mission & Values" name="vision_mission_values" header={aiSlot?.('vision_mission_values')} {...p} />
      <TextAreaField label="Current Alliances" name="current_alliances" {...p} />
    </div>
  )
}
