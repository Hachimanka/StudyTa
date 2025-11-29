import React from 'react'

export default function FileListBox({ files = [], onItemClick, loading = false }) {
  if (loading) {
    // Match skeleton count to existing file length (fallback to 4 if none yet)
    const skeletonCount = files.length > 0 ? files.length : 4
    return (
      <ul className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <li
            key={`skeleton-${idx}`}
            className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="inline-block w-6 h-6 rounded-full bg-gray-200" />
              <span className="h-4 w-48 rounded-md bg-gray-200" />
            </div>
            <span className="h-3 w-16 rounded-md bg-gray-200" />
          </li>
        ))}
      </ul>
    )
  }

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
          key={`${file.id || file.name}-${file.lastModified || idx}-${idx}`}
          className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onItemClick && onItemClick(file)}
        >
          <div className="flex items-center gap-3">
            <span className="inline-block w-6 h-6 rounded-full bg-[#8D5A3F]"></span>
            <span className="text-[#8D5A3F] font-medium">{file.name}</span>
          </div>
          <span className="text-xs text-gray-400">{file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : ''}</span>
        </li>
      ))}
    </ul>
  )
}
