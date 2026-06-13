'use client'
import {
  Box,
  Fab,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Fade,
  IconButton,
  Divider
} from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import ReusableVideoPlayer from 'src/components/VideoPlayer'
import GetChaarvyIcons from 'src/utils/icons'

interface ActiveVideo {
  blob_url: string
  title: string
}

export type Video = {
  title: string
  id: string
  blob_url: string
}

const ContextualHelp = () => {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState<ActiveVideo>()

  useEffect(() => {
    // Fetch videos based on the current page route
    fetch(`/api/help-videos?page_route=${router.pathname}`)
      .then(res => res.json())
      .then(data => setVideos(data))
  }, [router.pathname])

  if (videos.length === 0) return null

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
      {/* Video List & Player Popover */}
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            bottom: 72,
            right: 0,
            width: 340,
            borderRadius: 2,
            overflow: 'hidden',
            display: isOpen ? 'block' : 'none' // Prevents blocking clicks when faded out
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant='subtitle1' fontWeight='600'>
              Page Tutorials
            </Typography>
            <IconButton
              size='small'
              onClick={() => {
                setIsOpen(false)
                setActiveVideo(undefined)
              }}
              sx={{ color: 'inherit', p: 0.5 }}
            >
              <GetChaarvyIcons iconName='Close' />
            </IconButton>
          </Box>

          {/* Content Area */}
          <Box sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
            {activeVideo ? (
              <Box>
                <Button
                  startIcon={<GetChaarvyIcons iconName='ArrowLeft' />}
                  onClick={() => setActiveVideo(undefined)}
                  size='small'
                  sx={{ mb: 2, textTransform: 'none' }}
                >
                  Back to list
                </Button>
                <ReusableVideoPlayer videoUrl={activeVideo?.blob_url} title={activeVideo.title} />
              </Box>
            ) : (
              <List disablePadding>
                {videos.map((vid, index) => (
                  <Box key={vid.id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => setActiveVideo(vid)} sx={{ borderRadius: 1, py: 1.5 }}>
                        <GetChaarvyIcons iconName='PlayCircle' />
                        <ListItemText
                          primary={vid.title}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < videos.length - 1 && <Divider component='li' />}
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Help FAB (Floating Action Button) */}
      <Fab
        variant='circular'
        size='small'
        color='info'
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          textTransform: 'none',
          fontWeight: 'bold',
          boxShadow: 4
        }}
      >
        <GetChaarvyIcons iconName='Help' fontSize='1.25rem' />
      </Fab>
    </Box>
  )
}

export default ContextualHelp
