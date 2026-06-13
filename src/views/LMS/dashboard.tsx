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
import axios from 'axios' // Essential for tracking upload progress
import React, { useState } from 'react'

import { useGetAllHelpVideosQuery, useRequestUploadMutation } from 'src/store/services/MasterServices/helpServices'
import GetChaarvyIcons from 'src/utils/icons'

export default function VideoDashboard() {
  // RTK Query: Fetch videos and auto-poll every 15 seconds to check for "READY" status
  const { data: videos = [], refetch } = useGetAllHelpVideosQuery()
  const [requestUploadUrl] = useRequestUploadMutation()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState({ title: '', course: '' })

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

      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // STEP 1: Get the secure SAS URL from FastAPI via RTK Mutation
      const response = await requestUploadUrl({
        filename: file.name,
        contentType: file.type,
        title: formData.title,
        course: formData.course,
        page_route: window.location.pathname // Or let user select a route
      }).unwrap()

      const { uploadUrl } = response

      await axios.put(uploadUrl, file, {
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type
        },
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      })

      // STEP 3: Cleanup and Refresh
      setFormData({ title: '', course: '' })

      refetch()
    } catch (error) {
      console.error('Upload failed', error)
      alert('Failed to upload video to the server. Please check your connection.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'READY':
        return 'success'
      case 'PROCESSING':
        return 'warning'
      case 'FAILED':
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
                disabled={isUploading}
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
                disabled={isUploading}
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
              ...(isUploading ? {} : { '&:hover': { bgcolor: 'grey.100' } })
            }}
          >
            {isUploading ? (
              <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Uploading directly to secure storage...
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderBottom: 1,
              borderColor: 'grey.200'
            }}
          >
            <Typography variant='h6' fontWeight='600'>
              Media Library
            </Typography>
            <Button onClick={refetch}>Refresh</Button>
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
                {videos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                      No videos uploaded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  videos.map(video => (
                    <TableRow key={video.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant='body2' fontWeight='500'>
                          {video.title}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Duration: {video.duration || '--:--'}
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
                          variant={video.status === 'PROCESSING' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <Button
                          startIcon={<GetChaarvyIcons iconName='PlayCircle' fontSize='1.25rem' />}
                          disabled={video.status.toUpperCase() !== 'READY'}
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  )
}
