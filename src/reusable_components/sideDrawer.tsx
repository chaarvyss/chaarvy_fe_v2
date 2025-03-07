import * as React from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { Typography } from '@mui/material'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'

const SideDrawer = () => {
  const { isOpen, title, children, closeDrawer } = useSideDrawer()

  return (
    <Drawer open={isOpen} anchor='right' onClose={closeDrawer}>
      <Box sx={{ width: 250, padding: '1rem' }}>
        <Typography variant='h4' textAlign='center'>
          {title}
        </Typography>
        <Box marginTop='1rem'>{children}</Box>
      </Box>
    </Drawer>
  )
}

export default SideDrawer
