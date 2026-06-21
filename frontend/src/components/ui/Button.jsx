// Dark-first buttons. One dominant accent per view; calm secondary/ghost.
const VARIANTS = {
  primary:
    'bg-primary text-white border border-primary/40 hover:brightness-110 shadow-sm shadow-primary/30 disabled:opacity-50',
  secondary:
    'bg-neutral text-charcoal border border-white/10 hover:bg-background disabled:opacity-50',
  accent:
    'bg-cyan text-[#08131b] border border-cyan/40 hover:brightness-110 disabled:opacity-50',
  danger:
    'bg-transparent text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white disabled:opacity-50',
  success:
    'bg-green text-[#08131b] border border-green/40 hover:brightness-110 disabled:opacity-50',
  ghost:
    'bg-transparent text-charcoal border border-white/10 hover:bg-white/10 disabled:opacity-50',
}

export default function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-sm transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
