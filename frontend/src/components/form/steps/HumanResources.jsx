import { TextAreaField } from '../Field'

export default function HumanResources({ value, onChange, aiSlot }) {
  const p = { value, onChange }
  return (
    <div className="space-y-6">
      <TextAreaField label="Hiring Criteria" name="hiring_criteria" header={aiSlot?.('hiring_criteria')} {...p} />
      <TextAreaField label="Incentives to Employees" name="incentives" header={aiSlot?.('incentives')} {...p} />
      <TextAreaField label="Training and Development" name="training_development" {...p} />
      <TextAreaField label="Safety Measures Practiced" name="safety_measures" header={aiSlot?.('safety_measures')} {...p} />
      <TextAreaField label="Other Employee Welfare" name="employee_welfare" {...p} />
      <TextAreaField label="Other Concerns" name="other_concerns" rows={6} {...p} />
    </div>
  )
}
