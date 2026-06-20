import { PROVINCES, citiesOf, barangaysOf } from '../../data/caraga'

const SELECT_CLS = 'glass-input w-full text-charcoal text-sm px-3 py-2 rounded-lg'

// Cascading PH address: Province -> City/Municipality -> Barangay (+ street).
// Binds to value/onChange(name, val) using `<prefix>_province|city|barangay|street`.
export default function AddressField({ label, prefix, value, onChange }) {
  const province = value?.[`${prefix}_province`] || ''
  const city = value?.[`${prefix}_city`] || ''
  const barangay = value?.[`${prefix}_barangay`] || ''
  const street = value?.[`${prefix}_street`] || ''

  function setProvince(v) {
    onChange(`${prefix}_province`, v)
    onChange(`${prefix}_city`, '')
    onChange(`${prefix}_barangay`, '')
  }
  function setCity(v) {
    onChange(`${prefix}_city`, v)
    onChange(`${prefix}_barangay`, '')
  }

  return (
    <div className="space-y-3">
      {label && (
        <h3 className="text-sm font-semibold text-charcoal">{label}</h3>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Province
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Select province…</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            City / Municipality
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!province}
            className={SELECT_CLS}
          >
            <option value="">
              {province ? 'Select city/municipality…' : 'Select province first'}
            </option>
            {citiesOf(province).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            Barangay
          </label>
          <select
            value={barangay}
            onChange={(e) => onChange(`${prefix}_barangay`, e.target.value)}
            disabled={!city}
            className={SELECT_CLS}
          >
            <option value="">
              {city ? 'Select barangay…' : 'Select city first'}
            </option>
            {barangaysOf(province, city).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1">
          Street / Building (optional)
        </label>
        <input
          value={street}
          onChange={(e) => onChange(`${prefix}_street`, e.target.value)}
          className={SELECT_CLS}
          placeholder="House/Bldg No., Street, Subdivision"
        />
      </div>
    </div>
  )
}
