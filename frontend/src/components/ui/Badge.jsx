// Flat status badges. Colors per Blueprint §2.4.
const STATUS = {
  draft: 'bg-white/10 text-muted border-white/15',
  submitted: 'bg-cyan/15 text-cyan border-cyan/30',
  under_review: 'bg-yellow/15 text-yellow-300 border-yellow/30',
  validated: 'bg-green/15 text-green border-green/30',
  returned: 'bg-red-500/15 text-red-300 border-red-500/30',
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
  admin: 'bg-primary/15 text-primary border-primary/30',
  regional_director: 'bg-secondary/15 text-secondary border-secondary/30',
  tna_lead: 'bg-primary/15 text-primary border-primary/30',
  regional_evaluator: 'bg-cyan/15 text-cyan border-cyan/30',
  provincial_director: 'bg-green/15 text-green border-green/30',
  provincial_staff: 'bg-white/10 text-charcoal border-white/15',
  enterprise: 'bg-white/10 text-muted border-white/15',
}

const ROLE_LABELS = {
  admin: 'Admin',
  regional_director: 'Regional Director',
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
