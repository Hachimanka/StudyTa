import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'
import FileSearchBox from '../components/library/FileSearchBox'
import FileUploadButton from '../components/library/FileUploadButton'
import FileListBox from '../components/library/FileListBox'

export default function Library() {
  // 2. State to store the uploaded file
  const [selectedFile, setSelectedFile] = useState(null);

  // Track uploaded files list (newest first)
  const [files, setFiles] = useState([])

  // Handle file selection from upload button component: prepend to list
  const handleFileSelected = (file) => {
    if (file) {
      setFiles(prev => [file, ...prev])
      console.log(file)
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
            <FileSearchBox value={''} onChange={() => {}} />
            <FileUploadButton onFileSelected={handleFileSelected} />
          </div>
          {/* 8. Display area for the uploaded file */}
          <div className="mt-6">
            <FileListBox files={files} onItemClick={() => {}} />
          </div>
        </div>

      </main>
    </div>
  )
}
