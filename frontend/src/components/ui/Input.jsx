import { forwardRef } from 'react'

const base =
  'glass-input w-full text-charcoal text-sm px-3 py-2 rounded-lg disabled:opacity-60'

export const Input = forwardRef(function Input(
  { label, error, className = '', id, ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-charcoal mb-1"
        >
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={`${base} ${className}`} {...props} />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, className = '', id, rows = 4, ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-charcoal mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`${base} resize-y ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, className = '', id, children, ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-charcoal mb-1"
        >
          {label}
        </label>
      )}
      <select ref={ref} id={id} className={`${base} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
})
