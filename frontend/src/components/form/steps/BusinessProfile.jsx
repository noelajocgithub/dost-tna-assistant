import {
  TextField,
  TextAreaField,
  RadioGroup,
  SelectField,
  YearSelect,
  CurrencyField,
  FieldGrid,
} from '../Field'

// DOST TNA Form 01 — Business Activity categories.
const BUSINESS_ACTIVITIES = [
  'Food processing',
  'Furniture',
  'Gifts, decors, handicrafts',
  'Metals and engineering',
  'Agriculture/ Marine /Aquaculture',
  'Health products and pharmaceuticals',
  'Information and Communications Technology (ICT) products',
]

export default function BusinessProfile({ value, onChange, aiSlot }) {
  const p = { value, onChange }
  return (
    <div className="space-y-6">
      <FieldGrid>
        <YearSelect label="Year Established" name="year_established" {...p} />
        <YearSelect label="Year Registered" name="year_registered" {...p} />
        <CurrencyField label="Initial Capitalization (PHP)" name="initial_capitalization" {...p} />
        <CurrencyField label="Present Capitalization (PHP)" name="present_capitalization" {...p} />
        <TextField label="Registration No." name="registration_no" {...p} />
      </FieldGrid>

      <FieldGrid>
        <SelectField
          label="Business Activity"
          name="business_activity"
          options={BUSINESS_ACTIVITIES}
          {...p}
        />
        <TextField
          label="Commodity (please specify)"
          name="commodity"
          {...p}
        />
      </FieldGrid>

      <RadioGroup
        label="Organization Type"
        name="organization_type"
        options={[
          'Sole Proprietorship',
          'Partnership',
          'Corporation',
          'Cooperative',
        ]}
        {...p}
      />

      <TextAreaField
        label="Business Background"
        name="business_background"
        rows={6}
        header={aiSlot?.('business_background')}
        {...p}
      />
    </div>
  )
}
