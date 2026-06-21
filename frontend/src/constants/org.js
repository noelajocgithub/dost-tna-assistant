// Roles (value + display label). Must match config/tna.php `roles`.
export const ROLES = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'provincial_staff', label: 'Provincial Staff' },
  { value: 'provincial_director', label: 'Provincial Director' },
  { value: 'regional_evaluator', label: 'Regional Evaluator' },
  { value: 'tna_lead', label: 'TNA Lead' },
  { value: 'regional_director', label: 'Regional Director' },
  { value: 'admin', label: 'Admin' },
]

export const ROLE_LABELS = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label]),
)

// Organizational units. Must match config/tna.php `units`.
export const UNITS = [
  'PSTO-ADN',
  'PSTO-ADS',
  'PSTO-SDN',
  'PSTO-SDS',
  'PSTO-PDI',
  'INTERC',
]

// Provinces of the Caraga Region (Region XIII). Must match config/tna.php `provinces`.
export const PROVINCES = [
  'Agusan del Norte',
  'Agusan del Sur',
  'Surigao del Norte',
  'Surigao del Sur',
  'Dinagat Islands',
]
