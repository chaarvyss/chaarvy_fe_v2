import { AppBar, Button } from '@mui/material'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'

import { Box, Typography } from '@muiElements'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const AcadPro = () => {
  const router = useRouter()

  return (
    <Box sx={{ height: '100vh' }} display='flex' justifyContent='center' alignItems='center'>
      {/* Header  */}
      <Box>
        <AppBar position='absolute'>
          <Box display='flex' justifyContent='space-between' alignItems='center' padding='.75rem'>
            <Typography color='white' variant='h5'>
              Chaarvy - AcadPro
            </Typography>
            <Box display='flex'>
              <Button color='inherit' onClick={() => router.push('/login')}>
                Login
              </Button>
            </Box>
          </Box>
        </AppBar>
      </Box>
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
        <Typography variant='h5'>Chaarvy - AcadPro</Typography>
        <Typography variant='body1'>Under Development</Typography>
        <Typography variant='body2'>You can login and continue</Typography>
      </Box>
    </Box>
  )
}

AcadPro.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default AcadPro
