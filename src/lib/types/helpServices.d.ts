type VideoResponse = {
  id: string
  title: string
  course: string
  duration_seconds: string
  status: 'PROCESSING' | 'READY' | 'FAILED'
  uploadDate: string
  blob_url: string
}
