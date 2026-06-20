// Evaluator decision options — must match config/tna.php `evaluation_actions`.
export const EVALUATION_ACTIONS = [
  {
    value: 'approve',
    label: 'Approved',
    short: 'Approved',
    // Tailwind classes for selected / text states
    selected: 'bg-green text-white border-green',
    text: 'text-green',
    border: 'border-green',
    hover: 'hover:bg-green hover:text-white',
  },
  {
    value: 'approve_with_comments',
    label: 'Approved Subject to Compliance of Comments',
    short: 'Approved w/ comments',
    selected: 'bg-cyan text-white border-cyan',
    text: 'text-cyan',
    border: 'border-cyan',
    hover: 'hover:bg-cyan hover:text-white',
  },
  {
    value: 'needs_clarification',
    label: 'Needs Clarificatory Information',
    short: 'Needs clarification',
    selected: 'bg-yellow text-charcoal border-yellow',
    text: 'text-yellow',
    border: 'border-yellow',
    hover: 'hover:bg-yellow hover:text-charcoal',
  },
  {
    value: 'not_compliant',
    label: 'Not Compliant to DOST Guidelines',
    short: 'Not compliant',
    selected: 'bg-red-600 text-white border-red-600',
    text: 'text-red-600',
    border: 'border-red-300',
    hover: 'hover:bg-red-600 hover:text-white',
  },
]

export const ACTION_BY_VALUE = Object.fromEntries(
  EVALUATION_ACTIONS.map((a) => [a.value, a]),
)
