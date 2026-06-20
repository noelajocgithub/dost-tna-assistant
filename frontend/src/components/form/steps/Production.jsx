import { TextAreaField } from '../Field'
import DynamicTable from '../DynamicTable'
import ImageUploadField from '../ImageUploadField'

export default function Production({
  value,
  onChange,
  aiSlot,
  formId,
  editable,
  attachments = [],
  onAttachmentUploaded,
  onAttachmentRemoved,
}) {
  const p = { value, onChange }
  const plantLayout = attachments.find((a) => a.type === 'plant_layout') || null

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
        label="Cost of Production"
        name="cost_of_production"
        columns={[
          { key: 'product', label: 'Product' },
          { key: 'unit', label: 'Unit' },
          { key: 'volume_year', label: 'Volume / Year', type: 'decimal' },
          { key: 'unit_cost', label: 'Unit Cost of Production (PHP)', type: 'currency' },
          { key: 'annual_cost', label: 'Annual Cost of Production (PHP)', type: 'currency' },
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

      <TextAreaField label="Production Problems and Concerns" name="production_problems" header={aiSlot?.('production_problems')} {...p} />
      <TextAreaField label="Production Waste Management System" name="waste_management" header={aiSlot?.('waste_management')} {...p} />
      <TextAreaField label="Production System" name="production_plan" header={aiSlot?.('production_plan')} {...p} />
      <TextAreaField label="Production Planning and Control" name="production_planning_control" header={aiSlot?.('production_planning_control')} {...p} />
      <TextAreaField label="Work Study/Improvement" name="work_study_improvement" header={aiSlot?.('work_study_improvement')} {...p} />
      <TextAreaField label="Quality Assurance System" name="quality_assurance_system" header={aiSlot?.('quality_assurance_system')} {...p} />
      <TextAreaField label="Product and Process Performance & Improvement" name="product_process_performance" header={aiSlot?.('product_process_performance')} {...p} />
      <ImageUploadField
        label="Plant Layout (image)"
        formId={formId}
        type="plant_layout"
        attachment={plantLayout}
        editable={editable}
        disabled={!editable}
        onUploaded={onAttachmentUploaded}
        onRemoved={onAttachmentRemoved}
      />
      <TextAreaField label="Process Flow" name="process_flow" header={aiSlot?.('process_flow')} {...p} />
      <TextAreaField label="Inventory System" name="inventory_system" header={aiSlot?.('inventory_system')} {...p} />
      <TextAreaField label="Maintenance Program" name="maintenance_program" header={aiSlot?.('maintenance_program')} {...p} />

      <TextAreaField label="GMP/HACCP Activities" name="gmp_haccp_details" header={aiSlot?.('gmp_haccp_details')} {...p} />

      <TextAreaField label="Purchasing / Supplies System" name="purchasing_system" header={aiSlot?.('purchasing_system')} {...p} />
    </div>
  )
}
