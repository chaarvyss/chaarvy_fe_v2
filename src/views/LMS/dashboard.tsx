'use client'

import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Grid
} from '@mui/material'
import React, { useState, useEffect } from 'react'

import GetChaarvyIcons from 'src/utils/icons'

interface Video {
  id: string
  title: string
  course: string
  duration: string
  status: 'Processing' | 'Ready' | 'Failed'
  uploadDate: string
}

export default function VideoDashboard() {
  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      title: 'Introduction to Database Normalization',
      course: 'Class 10 - Computer Science',
      duration: '45:12',
      status: 'Ready',
      uploadDate: '2026-06-10'
    },
    {
      id: '2',
      title: 'Quadratic Equations Ex 3.2',
      course: 'Class 10 - Mathematics',
      duration: '32:40',
      status: 'Processing',
      uploadDate: '2026-06-12'
    }
  ])

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState({ title: '', course: '' })

  // Simulate polling backend for transcoding status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVideos(prev => prev.map(v => (v.status === 'Processing' ? { ...v, status: 'Ready' } : v)))
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!formData.title || !formData.course) {
      alert('Please fill in the Video Title and Course before uploading.')
      console.log(file)

      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Step 1: Request SAS token from FastAPI backend here
      setUploadProgress(40)

      // Step 2: Upload directly to Azure Blob Storage using the SAS URL here

      // Simulated Upload Progress
      const progInterval = setInterval(() => {
        setUploadProgress(old => {
          if (old >= 100) {
            clearInterval(progInterval)

            return 100
          }

          return old + 20
        })
      }, 400)

      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 3: Add to local state as "Processing"
      const newVideo: Video = {
        id: Math.random().toString(),
        title: formData.title,
        course: formData.course,
        duration: '--:--',
        status: 'Processing',
        uploadDate: new Date().toISOString().split('T')[0]
      }

      setVideos([newVideo, ...videos])
      setFormData({ title: '', course: '' })
    } catch (error) {
      console.error('Upload failed', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Helper for Chip colors based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'success'
      case 'Processing':
        return 'warning'
      case 'Failed':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Header */}
        <Box>
          <Typography variant='h4' component='h1' fontWeight='bold' gutterBottom>
            Video Content Manager
          </Typography>
          <Typography variant='subtitle1' color='text.secondary'>
            Upload curriculum lectures and manage automated HLS streaming outputs.
          </Typography>
        </Box>

        {/* Upload Panel */}
        <Paper elevation={0} variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='600' gutterBottom sx={{ mb: 3 }}>
            Upload New Lecture
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Video Title'
                variant='outlined'
                placeholder='e.g., Introduction to Calculus'
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Course / Class Assignment'
                variant='outlined'
                placeholder='e.g., Class 11 - Mathematics'
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Drag & Drop Target Area */}
          <Box
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'grey.300',
              bgcolor: dragActive ? 'primary.50' : 'grey.50',
              borderRadius: 2,
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            {isUploading ? (
              <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Uploading directly to storage...
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={uploadProgress}
                  sx={{ my: 2, height: 8, borderRadius: 4 }}
                />
                <Typography variant='caption' color='text.secondary'>
                  {uploadProgress}% Complete
                </Typography>
              </Box>
            ) : (
              <Box textAlign='center'>
                <GetChaarvyIcons iconName='CloudUploadOutline' fontSize='1.25rem' />
                <Typography variant='body1' color='text.secondary' gutterBottom>
                  Drag and drop your raw video here, or
                </Typography>
                <Button variant='outlined' component='label' sx={{ mt: 1 }}>
                  Browse Files
                  <input type='file' accept='video/*' hidden onChange={handleFileSelect} />
                </Button>
                <Typography variant='caption' display='block' color='text.secondary' sx={{ mt: 2 }}>
                  Supports MP4, MOV up to 2GB (Automatically transcodes to adaptive HLS)
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Video Library Table */}
        <Paper elevation={0} variant='outlined' sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'grey.200' }}>
            <Typography variant='h6' fontWeight='600'>
              Media Library
            </Typography>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label='video library table'>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Video Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Uploaded</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videos.map(video => (
                  <TableRow key={video.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography variant='body2' fontWeight='500'>
                        {video.title}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Duration: {video.duration}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{video.course}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {video.uploadDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={video.status}
                        color={getStatusColor(video.status)}
                        size='small'
                        variant={video.status === 'Processing' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        startIcon={<GetChaarvyIcons iconName='PlayCircle' fontSize='1.25rem' />}
                        disabled={video.status !== 'Ready'}
                        size='small'
                        sx={{ mr: 1 }}
                      >
                        Preview
                      </Button>
                      <Button
                        startIcon={<GetChaarvyIcons iconName='DeleteAlertOutline' fontSize='1.25rem' />}
                        color='error'
                        size='small'
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  )
}
