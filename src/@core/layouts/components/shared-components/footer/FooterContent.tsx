// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return (
    !hidden && (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ mr: 2 }}>
          {`© ${new Date().getFullYear()}, Made with `}
          <Box component='span' sx={{ color: 'error.main' }}>
            ❤️
          </Box>
          {` by `}
          chaarvy software solutions
        </Typography>
      </Box>
    )
  )
}

export default FooterContent
