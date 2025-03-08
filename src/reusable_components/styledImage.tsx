import { styled } from '@mui/material'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const StyledImage = ({ src, alt }: { src: string | Blob; alt?: string }) => {
  return <ImgStyled src={typeof src === 'string' ? src : URL.createObjectURL(src)} alt={alt || 'Styled Image'} />
}

export default StyledImage
