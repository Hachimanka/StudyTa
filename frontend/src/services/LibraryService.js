const API_BASE = '/api/library'

export async function listFiles(token) {
  const res = await fetch(`${API_BASE}/files`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if (!res.ok) throw new Error('Failed to fetch files')
  return res.json()
}

export async function uploadFile(file, folderId = 'root', token) {
  const form = new FormData()
  form.append('file', file)
  form.append('folderId', folderId)
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form
  })
  if (!res.ok) throw new Error('Failed to upload file')
  return res.json()
}

export async function deleteFile(fileId, token) {
  const res = await fetch(`${API_BASE}/file/${fileId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if (!res.ok) throw new Error('Failed to delete file')
  return res.json()
}

export async function downloadFile(fileId, token) {
  const res = await fetch(`${API_BASE}/download/${fileId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if (!res.ok) throw new Error('Failed to download file')
  const blob = await res.blob()
  return blob
}
