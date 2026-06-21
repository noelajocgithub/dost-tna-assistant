// Display-only humanization of snake_case data keys.
// The underlying keys in the database are never changed.
// e.g. pwds -> "PWDs", direct_male -> "Direct Male", ten_year_plan -> "Ten Year Plan"

// Words that need specific capitalization instead of plain Title Case.
const ACRONYMS = {
  pwd: 'PWD',
  pwds: 'PWDs',
  gmp: 'GMP',
  haccp: 'HACCP',
  php: 'PHP',
  id: 'ID',
}

export function humanizeKey(key) {
  if (key == null) return ''
  return String(key)
    .trim()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(
      (w) =>
        ACRONYMS[w.toLowerCase()] ||
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(' ')
}
