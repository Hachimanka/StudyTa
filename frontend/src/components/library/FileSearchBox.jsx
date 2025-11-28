import React from 'react'

export default function FileSearchBox({ value, onChange, className = '' }) {
  return (
    <input
      type="text"
      placeholder="Search files..."
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={className || 'w-100 h-10 border rounded-md px-2 py-1 border-[#8D5A3F]'}
    />
  )
}
