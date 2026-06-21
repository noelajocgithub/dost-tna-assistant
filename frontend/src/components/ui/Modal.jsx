import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'

// Flat modal: solid overlay, 1px border, no radius, no shadow.
export default function Modal({ open, onClose, title, children, footer }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg glass-strong rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <DialogTitle className="text-lg font-semibold text-charcoal">
              {title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-charcoal hover:bg-white/10 p-1 rounded-lg"
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-4">
              {footer}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
