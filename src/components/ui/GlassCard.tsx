import React from 'react'

export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...rest }) => {
  // Despite the name, this component follows the DESIGN_SYSTEM (minimal, no glass) — neutral card
  return (
    <div
      {...rest}
      className={`bg-[var(--color-cream)]/02 border border-transparent rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export default GlassCard
