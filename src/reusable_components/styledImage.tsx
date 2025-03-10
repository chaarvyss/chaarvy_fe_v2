import { styled } from '@mui/material'
import { useImageViewer } from 'src/@core/context/imageViewerContext'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer'
}))

const StyledImage = ({ src, alt }: { src: string | Blob; alt?: string }) => {
  const { setShowImage } = useImageViewer()

  const handleImageClick = () => {
    setShowImage?.(typeof src === 'string' ? src : (URL.createObjectURL(src) ?? ''))
  }

  return (
    <ImgStyled
      onClick={handleImageClick}
      src={typeof src === 'string' ? src : URL.createObjectURL(src)}
      alt={alt || 'Styled Image'}
    />
  )
}

export default StyledImage
