import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'
import FileSearchBox from '../components/library/FileSearchBox'
import FileUploadButton from '../components/library/FileUploadButton'
import FileListBox from '../components/library/FileListBox'
import { listFiles, uploadFile } from '../services/LibraryService'

export default function Library() {
  // Track uploaded files list (newest first)
  const [files, setFiles] = useState([])
  // Controlled search input
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch persisted files on mount
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listFiles()
        // data may already be array of file docs; normalize minimal fields used in UI
        const normalized = data.map(f => ({
          id: f._id || f.id,
          name: f.originalName || f.name || f.fileName,
          size: f.fileSize || f.size,
          type: f.fileType || f.type,
          uploadDate: f.createdAt || f.uploadDate,
        }))
        setFiles(normalized)
      } catch (e) {
        setError('Failed to load files')
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [])

  // Handle file selection from upload button component: prepend to list
  const handleFileSelected = async (file) => {
    if (!file) return
    setError(null)
    try {
      // Upload to backend then refresh list
      await uploadFile(file)
      const data = await listFiles()
      const normalized = data.map(f => ({
        id: f._id || f.id,
        name: f.originalName || f.name || f.fileName,
        size: f.fileSize || f.size,
        type: f.fileType || f.type,
        uploadDate: f.createdAt || f.uploadDate,
      }))
      setFiles(normalized)
    } catch (e) {
      setError('Upload failed')
    }
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
        <div className="max-w-7xl min-h-[600px] bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-end gap-2 mb-4 text-base font-semibold">
            <FileSearchBox value={searchTerm} onChange={setSearchTerm} />
            <FileUploadButton onFileSelected={handleFileSelected} />
          </div>
          {loading && <p className="text-sm text-gray-500">Loading files...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {/* 8. Display area for the uploaded file */}
          <div className="mt-6">
            {/* filter uploaded files by name (case-insensitive) */}
            <FileListBox loading={loading} files={files.filter(f => f.name && f.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))} onItemClick={() => {}} />
          </div>
        </div>

      </main>
    </div>
  )
}
