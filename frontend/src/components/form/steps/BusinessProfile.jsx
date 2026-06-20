import {
  TextField,
  TextAreaField,
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

const ORGANIZATION_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
]

// DOST MSME classification by asset size (PHP).
const CAPITAL_CLASSES = [
  'Micro (less than 1.5 M)',
  'Small (1.5 – 15 M)',
  'Medium (15 – 100 M)',
]

// DOST MSME classification by headcount.
const EMPLOYMENT_CLASSES = [
  'Micro (1 – 9)',
  'Small (10 – 99)',
  'Medium (100 – 199)',
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

      <FieldGrid>
        <SelectField
          label="Organization Type"
          name="organization_type"
          options={ORGANIZATION_TYPES}
          {...p}
        />
        <SelectField
          label="Classification according to capital (PhP)"
          name="capital_classification"
          options={CAPITAL_CLASSES}
          {...p}
        />
        <SelectField
          label="Classification according to employment (number of employees)"
          name="employment_classification"
          options={EMPLOYMENT_CLASSES}
          {...p}
        />
      </FieldGrid>

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
