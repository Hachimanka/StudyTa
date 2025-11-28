import React, { useRef } from 'react'

export default function FileUploadButton({ onFileSelected, label = 'Upload File', className = '' }) {
  const inputRef = useRef(null)
  const handleClick = () => inputRef.current?.click()
  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file && onFileSelected) onFileSelected(file)
  }

  return (
    <>
      <input type="file" ref={inputRef} onChange={handleChange} className="hidden" />
      <button onClick={handleClick} className={className || 'w-40 text-white px-3 psy-1 rounded-md bg-[#8D5A3F] hover:bg-[#a06b51]'}>
        {label}
      </button>
    </>
  )
}
