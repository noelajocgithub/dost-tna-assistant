import { TextAreaField, YesNo } from '../Field'
import DynamicTable from '../DynamicTable'

export default function Production({ value, onChange, aiSlot }) {
  const p = { value, onChange }
  const gmp = value?.has_gmp_haccp === 'Yes'

  return (
    <div className="space-y-6">
      <DynamicTable
        label="Raw Materials"
        name="raw_materials"
        columns={[
          { key: 'material', label: 'Material' },
          { key: 'source', label: 'Source' },
          { key: 'unit', label: 'Unit' },
          { key: 'unit_cost', label: 'Unit Cost (PHP)', type: 'currency' },
          { key: 'volume_year', label: 'Unit Volume / Year', type: 'decimal' },
        ]}
        {...p}
      />

      <DynamicTable
        label="Production"
        name="production"
        columns={[
          { key: 'product', label: 'Product' },
          { key: 'unit', label: 'Unit' },
          { key: 'volume_year', label: 'Volume / Year', type: 'decimal' },
          { key: 'unit_cost', label: 'Price Per Unit (PHP)', type: 'currency' },
          { key: 'annual_cost', label: 'Annual Revenue (PHP)', type: 'currency' },
        ]}
        {...p}
      />

      <DynamicTable
        label="Equipment Inventory"
        name="equipment"
        columns={[
          { key: 'type', label: 'Type' },
          { key: 'specs', label: 'Specifications' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'units', label: 'No. of Units', type: 'integer' },
          { key: 'year_acquired', label: 'Year Acquired', type: 'year', from: 1950 },
        ]}
        {...p}
      />

      <TextAreaField label="Production Problems" name="production_problems" header={aiSlot?.('production_problems')} {...p} />
      <TextAreaField label="Waste Management" name="waste_management" header={aiSlot?.('waste_management')} {...p} />
      <TextAreaField label="Production Plan" name="production_plan" header={aiSlot?.('production_plan')} {...p} />
      <TextAreaField label="Process Flow Description" name="process_flow" {...p} />
      <TextAreaField label="Inventory System" name="inventory_system" header={aiSlot?.('inventory_system')} {...p} />
      <TextAreaField label="Maintenance Program" name="maintenance_program" header={aiSlot?.('maintenance_program')} {...p} />

      <YesNo label="GMP / HACCP Activities?" name="has_gmp_haccp" {...p} />
      {gmp && (
        <TextAreaField label="GMP / HACCP Details" name="gmp_haccp_details" {...p} />
      )}

      <TextAreaField label="Purchasing / Supplies System" name="purchasing_system" header={aiSlot?.('purchasing_system')} {...p} />
    </div>
  )
}
