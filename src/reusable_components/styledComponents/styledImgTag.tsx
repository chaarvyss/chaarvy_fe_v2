import { styled } from '@mui/material'

export const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,

  //   marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))
