// Flat status badges. Colors per Blueprint §2.4.
const STATUS = {
  draft: 'bg-neutral text-charcoal border-neutral',
  submitted: 'bg-cyan text-white border-cyan',
  under_review: 'bg-yellow text-charcoal border-yellow',
  validated: 'bg-green text-white border-green',
  returned: 'bg-red-100 text-red-700 border-red-300',
}

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  validated: 'Validated',
  returned: 'Returned',
}

export function StatusBadge({ status }) {
  const cls = STATUS[status] || STATUS.draft
  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 border rounded-full backdrop-blur-sm ${cls}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

const ROLE = {
  admin: 'bg-primary text-white border-primary',
  tna_lead: 'bg-primary text-white border-primary',
  regional_evaluator: 'bg-cyan text-white border-cyan',
  provincial_director: 'bg-green text-white border-green',
  provincial_staff: 'bg-charcoal text-white border-charcoal',
  enterprise: 'bg-neutral text-charcoal border-neutral',
}

const ROLE_LABELS = {
  admin: 'Admin',
  tna_lead: 'TNA Lead',
  regional_evaluator: 'Evaluator',
  provincial_director: 'Provincial Director',
  provincial_staff: 'Provincial Staff',
  enterprise: 'Enterprise',
}

export function RoleBadge({ role }) {
  const cls = ROLE[role] || ROLE.enterprise
  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 border rounded-full backdrop-blur-sm ${cls}`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  )
}
