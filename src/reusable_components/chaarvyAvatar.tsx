import { AvatarProps } from '@mui/material'
import { Avatar } from '@muiElements'
import React from 'react'
import { useImageViewer } from 'src/@core/context/imageViewerContext'

const ChaarvyAvatar = ({ ...props }: AvatarProps) => {
  const { setShowImage } = useImageViewer()

  const handleImageView = () => {
    if (props.src) {
      setShowImage?.(props.src)
    }
  }

  return <Avatar sx={{ cursor: 'pointer' }} onClick={handleImageView} {...props} />
}

export default ChaarvyAvatar
