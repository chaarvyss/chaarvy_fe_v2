import { Box, Button } from '@mui/material'
import { useRef, useState } from 'react'

import { useGetVideoLinkQuery } from 'src/store/services/MasterServices/helpServices'
import GetChaarvyIcons from 'src/utils/icons'

const ReusableVideoPlayer = ({ videoPath, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPip, setIsPip] = useState(false)

  const { data: videoLink } = useGetVideoLinkQuery(videoPath, {
    skip: !videoPath
  })

  const togglePiP = async () => {
    try {
      if (!videoRef.current) return

      if (videoRef.current !== document.pictureInPictureElement) {
        await videoRef.current.requestPictureInPicture()
        setIsPip(true)
      } else {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        }
        setIsPip(false)
      }
    } catch (error) {
      console.error('PiP failed to initialize', error)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3,
        bgcolor: 'common.black'
      }}
    >
      <Box
        component='video'
        ref={videoRef}
        src={videoLink}
        controls
        title={title}
        controlsList='nodownload'
        preload='metadata' // Helps with faster initial load
        sx={{
          width: '100%',
          height: 'auto',
          display: 'block' // Removes default bottom gap of media elements
        }}
      />

      {/* Custom PiP Button overlaid on top right */}
      <Button
        onClick={togglePiP}
        variant='contained'
        size='small'
        startIcon={<GetChaarvyIcons iconName={isPip ? 'FullscreenExit' : 'PictureInPictureTopRight'} />}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: 'rgba(33, 33, 33, 0.75)',
          color: 'common.white',
          textTransform: 'none',
          backdropFilter: 'blur(4px)', // Adds a nice frosted glass effect behind the button
          '&:hover': {
            bgcolor: 'rgba(33, 33, 33, 1)'
          }
        }}
      >
        {isPip ? 'Exit PiP' : 'PiP Mode'}
      </Button>
    </Box>
  )
}

export default ReusableVideoPlayer
