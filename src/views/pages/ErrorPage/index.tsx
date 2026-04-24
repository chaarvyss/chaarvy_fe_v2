import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { ReactNode } from 'react'

import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import GetChaarvyIcons from 'src/utils/icons'
import FooterIllustrations from 'src/views/pages/misc/FooterIllustrations'

const TreeIllustration = styled('img')(({ theme }) => ({
  left: 0,
  bottom: '5rem',
  position: 'absolute',
  [theme.breakpoints.down('lg')]: {
    bottom: 0
  }
}))

const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  marginBottom: theme.spacing(10),
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(13)
  }
}))

type Errors = 404 | 401 | 500

interface ErrorCodeObject {
  errorCode: Errors
  errorText: string
  caption: string
  illustrationImage?: ReactNode
}

const CommonWrapper = ({ error }: { error: Errors }) => {
  const errorMapper: Record<Errors, ErrorCodeObject> = {
    401: {
      errorCode: error,
      errorText: 'You are not authorized! 🔐',
      caption: "You don't have permission to access this page. Go Home!"
    },
    404: {
      errorCode: error,
      errorText: 'Page Not Found ⚠️',
      caption: "We couldn't find the page you are looking for.",
      illustrationImage: <TreeIllustration alt='tree' src='/images/pages/tree-3.png' />
    },
    500: {
      errorCode: error,
      errorText: 'Internal server error 👨🏻‍💻',
      caption: 'Oops, something went wrong!',
      illustrationImage: <TreeIllustration alt='tree' src='/images/pages/tree-3.png' />
    }
  }

  const { errorCode, errorText, caption, illustrationImage } = errorMapper[error]

  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h2'>{errorCode}</Typography>
          <Typography variant='h6' sx={{ mb: 1, fontSize: '1.5rem !important' }}>
            {errorText}
          </Typography>
          <Typography variant='body1'>{caption}</Typography>
        </BoxWrapper>
        <Img height='280' alt='error-illustration' src={`/images/pages/${errorCode}.png`} />
        <Link passHref href='/dashboard'>
          <ChaarvyButton
            leftIcon={<GetChaarvyIcons iconName='Home' fontSize='1.25rem' />}
            size='small'
            component='a'
            variant='contained'
            sx={{ px: 5.5 }}
          >
            Back to Home
          </ChaarvyButton>
        </Link>
      </Box>
      <FooterIllustrations image={illustrationImage ?? null} />
    </Box>
  )
}

const ErrorPage = ({ error }: { error: Errors }) => {
  return CommonWrapper({ error })
}

export default ErrorPage
