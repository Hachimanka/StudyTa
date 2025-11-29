import fs from 'fs'
import path from 'path'
import UploadedFile from '../models/UploadedFile.js'
import Folder from '../models/Folder.js'

export async function uploadFile(req, res) {
  try {
    const userId = req.user?.id || req.user?._id
    const { folderId = 'root' } = req.body

    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const { filename, originalname, size, mimetype, path: filePath } = req.file
    const isImage = mimetype.startsWith('image/')
    const isText = mimetype === 'text/plain' || originalname.endsWith('.txt')

    let fileData = null
    let textContent = null

    if (size < 5 * 1024 * 1024) {
      if (isImage || mimetype === 'application/pdf') {
        try {
          const buf = fs.readFileSync(filePath)
          fileData = buf.toString('base64')
        } catch {}
      }
    }

    if (isText) {
      try { textContent = fs.readFileSync(filePath, 'utf8') } catch {}
    }

    const doc = new UploadedFile({
      userId,
      fileName: filename,
      originalName: originalname,
      fileSize: size,
      fileType: mimetype,
      filePath,
      folderId,
      fileData,
      isImage,
      isText,
      textContent,
      lastModified: Date.now()
    })

    await doc.save()
    return res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: doc._id,
        name: doc.originalName,
        size: doc.fileSize,
        type: doc.fileType,
        uploadDate: doc.createdAt,
        dataUrl: fileData ? `data:${mimetype};base64,${fileData}` : null,
        content: textContent,
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload file' })
  }
}

export async function listFiles(req, res) {
  try {
    const userId = req.user?.id || req.user?._id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const files = await UploadedFile.find({ userId }).sort({ createdAt: -1 })
    return res.json(files)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch files' })
  }
}

export async function downloadFile(req, res) {
  try {
    const userId = req.user?.id || req.user?._id
    const { fileId } = req.params
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const file = await UploadedFile.findOne({ _id: fileId, userId })
    if (!file) return res.status(404).json({ error: 'File not found' })
    if (!fs.existsSync(file.filePath)) return res.status(404).json({ error: 'Physical file not found' })
    return res.download(file.filePath, file.originalName)
  } catch {
    return res.status(500).json({ error: 'Failed to download file' })
  }
}

export async function deleteFile(req, res) {
  try {
    const userId = req.user?.id || req.user?._id
    const { fileId } = req.params
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const file = await UploadedFile.findOne({ _id: fileId, userId })
    if (!file) return res.status(404).json({ error: 'File not found' })
    if (file.filePath && fs.existsSync(file.filePath)) {
      try { fs.unlinkSync(file.filePath) } catch {}
    }
    await UploadedFile.findByIdAndDelete(fileId)
    return res.json({ message: 'File deleted successfully' })
  } catch {
    return res.status(500).json({ error: 'Failed to delete file' })
  }
}

export async function getLibraryTree(req, res) {
  try {
    const userId = req.user?.id || req.user?._id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const files = await UploadedFile.find({ userId }).sort({ createdAt: -1 })
    const folders = await Folder.find({ userId }).sort({ createdAt: -1 })

    const build = (parentId = 'root') => {
      const subfolders = folders.filter(f => (f.parentFolderId || 'root') === parentId)
      return subfolders.map(folder => ({
        id: folder._id,
        name: folder.name,
        expanded: folder.expanded,
        files: files.filter(fl => (fl.folderId || 'root') === folder._id.toString()).map(fl => ({
          id: fl._id,
          name: fl.originalName,
          size: fl.fileSize,
          type: fl.fileType,
          uploadDate: fl.createdAt,
          dataUrl: fl.fileData ? `data:${fl.fileType};base64,${fl.fileData}` : null,
          content: fl.textContent,
        })),
        folders: build(folder._id.toString())
      }))
    }

    const library = {
      id: 'root',
      name: 'My Library',
      files: files.filter(fl => (fl.folderId || 'root') === 'root').map(fl => ({
        id: fl._id,
        name: fl.originalName,
        size: fl.fileSize,
        type: fl.fileType,
        uploadDate: fl.createdAt,
        dataUrl: fl.fileData ? `data:${fl.fileType};base64,${fl.fileData}` : null,
        content: fl.textContent,
      })),
      folders: build()
    }

    return res.json(library)
  } catch {
    return res.status(500).json({ error: 'Failed to get library' })
  }
}