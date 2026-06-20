import { TextField, EmailField, FieldGrid } from '../Field'
import AddressField from '../AddressField'

export default function EnterpriseInfo({ value, onChange }) {
  const p = { value, onChange }
  return (
    <div className="space-y-6">
      <FieldGrid>
        <TextField label="Enterprise Name" name="enterprise_name" {...p} />
        <TextField label="Contact Person" name="contact_person" {...p} />
        <TextField label="Position" name="position" {...p} />
        <TextField label="Website" name="website" {...p} />
      </FieldGrid>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal">Office</h3>
        <AddressField prefix="office" {...p} />
        <FieldGrid>
          <TextField label="Office Tel" name="office_tel" {...p} />
          <TextField label="Office Fax" name="office_fax" {...p} />
          <EmailField label="Office Email" name="office_email" {...p} />
        </FieldGrid>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal">Factory</h3>
        <AddressField prefix="factory" {...p} />
        <FieldGrid>
          <TextField label="Factory Tel" name="factory_tel" {...p} />
          <TextField label="Factory Fax" name="factory_fax" {...p} />
          <EmailField label="Factory Email" name="factory_email" {...p} />
        </FieldGrid>
      </div>
    </div>
  )
}
