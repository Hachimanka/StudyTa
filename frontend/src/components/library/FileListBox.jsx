import React from 'react'

export default function FileListBox({ files = [], onItemClick }) {
  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed rounded-lg border-gray-300">
        <p>No files uploaded yet.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {files.map((file, idx) => (
        <li
          key={`${file.name}-${file.lastModified}-${idx}`}
          className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onItemClick && onItemClick(file)}
        >
          <div className="flex items-center gap-3">
            <span className="inline-block w-6 h-6 rounded-full bg-[#8D5A3F]"></span>
            <span className="text-[#8D5A3F] font-medium">{file.name}</span>
          </div>
          <span className="text-xs text-gray-400">{new Date(file.lastModified).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  )
}
