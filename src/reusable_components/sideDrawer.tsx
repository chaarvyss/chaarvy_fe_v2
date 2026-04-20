import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'

import { useSideDrawer } from 'src/@core/context/sideDrawerContext'

const SideDrawer = () => {
  const { isOpen, title, children, closeDrawer, size = 'small' } = useSideDrawer()

  const sizeMap = {
    small: '20vw',
    medium: '40vw',
    large: '60vw'
  }

  return (
    <Drawer open={isOpen} anchor='right' onClose={closeDrawer}>
      <Box sx={{ width: sizeMap[size], minWidth: '300px', padding: '1rem' }}>
        <Typography variant='h5' textAlign='center'>
          {title}
        </Typography>
        <Box marginTop='1rem'>{children}</Box>
      </Box>
    </Drawer>
  )
}

export default SideDrawer
