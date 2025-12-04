import { styled } from '@mui/material'

import { useImageViewer } from 'src/@core/context/imageViewerContext'

const ImgStyled = styled('img')<{ $variant?: 'rounded' }>(({ theme, $variant }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: $variant === 'rounded' ? '50%' : theme.shape.borderRadius,
  cursor: 'pointer'
}))

interface StyledImageProps {
  src: string | Blob
  alt?: string
  variant?: 'rounded'
}

const StyledImage = ({ src, alt, variant }: StyledImageProps) => {
  const { setShowImage } = useImageViewer()

  const handleImageClick = () => {
    setShowImage?.(typeof src === 'string' ? src : (URL.createObjectURL(src) ?? ''))
  }

  return (
    <ImgStyled
      onClick={handleImageClick}
      src={typeof src === 'string' ? src : URL.createObjectURL(src)}
      alt={alt || 'Styled Image'}
      $variant={variant}
    />
  )
}

export default StyledImage
