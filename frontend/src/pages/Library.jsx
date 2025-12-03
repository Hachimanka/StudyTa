import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'
import FileSearchBox from '../components/library/FileSearchBox'
import FileUploadButton from '../components/library/FileUploadButton'
import FileListBox from '../components/library/FileListBox'
import { listFiles, uploadFile, deleteFile as apiDeleteFile, renameFile as apiRenameFile } from '../services/LibraryService'
import { useAuth } from '../context/AuthContext'

export default function Library() {
  const { user } = useAuth()
  // Track uploaded files list (newest first)
  const [files, setFiles] = useState([])
  // Controlled search input
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmOpenModal, setConfirmOpenModal] = useState(false)
  const [pendingOpenFile, setPendingOpenFile] = useState(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [menuTarget, setMenuTarget] = useState(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const fileInputRef = React.useRef(null)

  // Fetch persisted files on mount
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!user?._id) {
          setFiles([])
          return
        }
        const data = await listFiles(undefined, user?._id)
        // data may already be array of file docs; normalize minimal fields used in UI
        const normalized = data.map(f => ({
          id: f._id || f.id,
          name: f.originalName || f.name || f.fileName,
          size: f.fileSize || f.size,
          type: f.fileType || f.type,
          uploadDate: f.createdAt || f.uploadDate,
        }))
        // Sort newest first by uploadDate
        normalized.sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
        setFiles(normalized)
      } catch (e) {
        setError('Failed to load files')
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [user?._id])

  // Handle file selection from upload button component: prepend to list
  const handleFileSelected = async (file) => {
    if (!file) return
    if (!user?._id) {
      setError('You must be logged in to upload')
      return
    }
    setError(null)
    try {
      // Upload to backend then refresh list
      await uploadFile(file, 'root', undefined, user?._id)
      const data = await listFiles(undefined, user?._id)
      const normalized = data.map(f => ({
        id: f._id || f.id,
        name: f.originalName || f.name || f.fileName,
        size: f.fileSize || f.size,
        type: f.fileType || f.type,
        uploadDate: f.createdAt || f.uploadDate,
      }))
      // Sort newest first by uploadDate
      normalized.sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
      setFiles(normalized)
    } catch (e) {
      setError('Upload failed')
    }
  }

  // Allowed types for in-browser opening
  const ALLOW_INLINE = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
  // Image types for inline viewer
  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  const handleCardClick = (file) => {
    if (!file || !file.type) return
    // If image, open image viewer modal
    if (IMAGE_TYPES.includes(file.type)) {
      setPendingOpenFile(file)
      setImageViewerOpen(true)
      return
    }
    // If supported doc types, show confirm to open in browser
    if (ALLOW_INLINE.includes(file.type)) {
      setPendingOpenFile(file)
      setConfirmOpenModal(true)
    }
  }

  // Context menu handlers
  const handleContextMenu = (e, file) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuTarget(file || null)
    // Use clientX/clientY for fixed-position menu to appear at cursor
    const x = e.clientX
    const y = e.clientY
    setMenuPos({ x, y })
    setMenuOpen(true)
  }

  const closeMenu = () => setMenuOpen(false)

  const actionUpload = () => {
    closeMenu()
    fileInputRef.current?.click()
  }

  // Create folder action intentionally removed from context menu per request

  const actionDeleteFile = () => {
    closeMenu()
    if (!menuTarget) return
    setDeleteTarget(menuTarget)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const id = deleteTarget.id || deleteTarget._id
      await apiDeleteFile(id)
      setFiles(prev => prev.filter(f => (f.id || f._id) !== id))
      setConfirmDeleteOpen(false)
      setDeleteTarget(null)
    } catch (e) {
      setError('Failed to delete file')
      setConfirmDeleteOpen(false)
    }
  }

  const cancelDelete = () => {
    setConfirmDeleteOpen(false)
    setDeleteTarget(null)
  }

  const actionRenameFile = async () => {
    closeMenu()
    if (!menuTarget) return
    setRenameTarget(menuTarget)
    setRenameValue(menuTarget.name || '')
    setRenameOpen(true)
  }

  const confirmRename = async () => {
    if (!renameTarget) return
    const newName = (renameValue || '').trim()
    if (!newName || newName === (renameTarget.name || '')) {
      setRenameOpen(false)
      setRenameTarget(null)
      return
    }
    try {
      const id = renameTarget.id || renameTarget._id
      await apiRenameFile(id, newName)
      setFiles(prev => prev.map(f => (f.id || f._id) === id ? { ...f, name: newName } : f))
      setRenameOpen(false)
      setRenameTarget(null)
    } catch (e) {
      setError('Failed to rename file')
      setRenameOpen(false)
    }
  }

  const cancelRename = () => {
    setRenameOpen(false)
    setRenameTarget(null)
  }

  const confirmOpenInBrowser = () => {
    if (!pendingOpenFile) return
    // Open backend inline view endpoint in a new tab
    const id = pendingOpenFile.id || pendingOpenFile._id
    if (id) {
      window.open(`/api/library/view/${id}`, '_blank')
    }
    setConfirmOpenModal(false)
    setPendingOpenFile(null)
  }

  const cancelOpen = () => {
    setConfirmOpenModal(false)
    setPendingOpenFile(null)
  }

  const closeImageViewer = () => {
    setImageViewerOpen(false)
    setPendingOpenFile(null)
  }
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12 ml-20 md:ml-30 font-poppins">
        <div className="mb-8">
          <h1 className="text-5xl font-bold transition-colors duration-300 text-[#6F422B]">Library</h1>
          <p className="mt-1 text-xl transition-colors duration-300 text-[#5C4333]"> Keep all your notes and study files in one place.</p>
        </div>
        {/*  card  */}
        <div className="max-w-7xl min-h-[600px] bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex justify-end gap-2 mb-4 text-base font-semibold">
            <FileSearchBox value={searchTerm} onChange={setSearchTerm} />
            <FileUploadButton onFileSelected={handleFileSelected} />
          </div>
          {loading && <p className="text-sm text-gray-500">Loading files...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {/* 8. Display area for the uploaded file */}
          <div className="mt-6 flex-1">
            {/* filter uploaded files by name (case-insensitive) */}
            <div onClick={() => setMenuOpen(false)}>
              {/* Scrollable list container fills remaining space */}
              <div className="h-full overflow-y-auto pr-1">
              <FileListBox
                loading={loading}
                files={files.filter(f => f.name && f.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))}
                onItemClick={handleCardClick}
                onItemContextMenu={handleContextMenu}
              />
              </div>
            </div>
          </div>
        </div>

        {/* Hidden input for context menu upload */}
        <input ref={fileInputRef} type="file" onChange={(e) => handleFileSelected(e.target.files?.[0])} className="hidden" />

        {/* Context menu */}
        {menuOpen && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg text-sm"
            style={{ left: menuPos.x, top: menuPos.y }}
            onMouseLeave={closeMenu}
          >
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={actionUpload}>Upload File</button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={actionDeleteFile} disabled={!menuTarget}>Delete File</button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={actionRenameFile} disabled={!menuTarget}>Rename File</button>
          </div>
        )}

        {/* Delete confirmation modal */}
        {confirmDeleteOpen && deleteTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold text-[#5C4333] mb-2">Delete this file?</h2>
              <p className="text-sm text-gray-600 mb-4">{deleteTarget.name}</p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelDelete} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}

        {confirmOpenModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold text-[#5C4333] mb-2">Open in browser?</h2>
              <p className="text-sm text-gray-600 mb-4">This will open the file in a new browser tab.</p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelOpen} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700">Cancel</button>
                <button onClick={confirmOpenInBrowser} className="px-4 py-2 rounded-md bg-[#8D5A3F] text-white hover:bg-[#a06b51]">Open</button>
              </div>
            </div>
          </div>
        )}

        {imageViewerOpen && pendingOpenFile && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeImageViewer}>
            <div className="relative bg-white rounded-xl shadow-xl p-3 max-w-5xl w-[95%]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-[#5C4333] truncate">{pendingOpenFile.name}</h2>
                <button className="px-3 py-1 rounded-md border text-[#5C4333]" onClick={closeImageViewer}>Close</button>
              </div>
              <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-lg">
                {/* Display image served by backend inline view endpoint */}
                <img
                  src={`/api/library/view/${pendingOpenFile.id || pendingOpenFile._id}`}
                  alt={pendingOpenFile.name}
                  className="max-h-[75vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Rename modal */}
        {renameOpen && renameTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
              <h2 className="text-lg font-semibold text-[#5C4333] mb-2">Rename file</h2>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#8D5A3F]"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={cancelRename} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700">Cancel</button>
                <button onClick={confirmRename} className="px-4 py-2 rounded-md bg-[#8D5A3F] text-white hover:bg-[#a06b51]">Save</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
