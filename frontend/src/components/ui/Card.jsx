// Frosted-glass card. Translucent surface, blur, soft shadow, rounded corners.
export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`glass rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  )
}
