import { CardProps } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLoader } from 'src/@core/context/loaderContext'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import themeConfig from 'src/configs/themeConfig'
import { sessionStorageKeys } from 'src/lib/enums'
import { getEmptyKeysList } from 'src/lib/helpers'
import { LoginProps } from 'src/lib/interfaces'
import { setAvailablePermissionsData } from 'src/store/permissionSlice'
import { useLoginMutation } from 'src/store/services/authServices'
import { EyeOutline, EyeOffOutline } from 'src/utils/mdiElements'
import {
  Box,
  Button,
  CardContent,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MuiCard,
  OutlinedInput,
  TextField,
  Typography
} from 'src/utils/muiElements'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

import { useSettings } from 'src/@core/hooks/useSettings'

interface State {
  clcode: string
  username: string
  password: string
  showPassword: boolean
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const LoginPage = () => {
  const dispatch = useDispatch()
  const { setLoading } = useLoader()

  // ** State
  const [values, setValues] = useState<LoginProps>({
    clcode: '',
    username: '',
    password: ''
  })

  const [errors, setErrors] = useState<Array<string>>([])
  const { settings, saveSettings } = useSettings()
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem(sessionStorageKeys.accessToken)) {
      router.push('/')
    } else {
      setValues({ ...values, clcode: localStorage.getItem(sessionStorageKeys.clientCode) ?? '' })
    }
  }, [])

  const [login, { isLoading }] = useLoginMutation()
  const { triggerToast } = useToast()
  setLoading(isLoading)
  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const emptyKeys = getEmptyKeysList(values)

    if (emptyKeys?.length == 0) {
      login(values)
        .unwrap()
        .then(response => {
          const res = response as any
          dispatch(setAvailablePermissionsData(response.permission))
          triggerToast('Login Successful', { variant: ToastVariants.SUCCESS })
          localStorage.setItem(sessionStorageKeys.clientCode, res.data.clcode)
          saveSettings({ ...settings, current_username: res.data.name })
          sessionStorage.setItem(sessionStorageKeys.accessToken, res.data.authToken)
          sessionStorage.setItem(sessionStorageKeys.clientCode, res.data.clcode)
          router.push('/dashboard')
        })
        .catch(e => {
          triggerToast(e?.data, { variant: ToastVariants.ERROR })
        })
    }
    setErrors(emptyKeys)
  }

  const [showPassword, setShowPassword] = useState<boolean>(false)

  // ** Hook
  const theme = useTheme()

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex',cursor:'pointer', alignItems: 'center', justifyContent: 'center' }} onClick={()=>router.push('/')}>
            <svg
              width={35}
              height={29}
              version='1.1'
              viewBox='0 0 30 23'
              xmlns='http://www.w3.org/2000/svg'
              xmlnsXlink='http://www.w3.org/1999/xlink'
            >
              <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                <g id='Artboard' transform='translate(-95.000000, -51.000000)'>
                  <g id='logo' transform='translate(95.000000, 50.000000)'>
                    <path
                      id='Combined-Shape'
                      fill={theme.palette.primary.main}
                      d='M30,21.3918362 C30,21.7535219 29.9019196,22.1084381 29.7162004,22.4188007 C29.1490236,23.366632 27.9208668,23.6752135 26.9730355,23.1080366 L26.9730355,23.1080366 L23.714971,21.1584295 C23.1114106,20.7972624 22.7419355,20.1455972 22.7419355,19.4422291 L22.7419355,19.4422291 L22.741,12.7425689 L15,17.1774194 L7.258,12.7425689 L7.25806452,19.4422291 C7.25806452,20.1455972 6.88858935,20.7972624 6.28502902,21.1584295 L3.0269645,23.1080366 C2.07913318,23.6752135 0.850976404,23.366632 0.283799571,22.4188007 C0.0980803893,22.1084381 2.0190442e-15,21.7535219 0,21.3918362 L0,3.58469444 L0.00548573643,3.43543209 L0.00548573643,3.43543209 L0,3.5715689 C3.0881846e-16,2.4669994 0.8954305,1.5715689 2,1.5715689 C2.36889529,1.5715689 2.73060353,1.67359571 3.04512412,1.86636639 L15,9.19354839 L26.9548759,1.86636639 C27.2693965,1.67359571 27.6311047,1.5715689 28,1.5715689 C29.1045695,1.5715689 30,2.4669994 30,3.5715689 L30,3.5715689 Z'
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='0 8.58870968 7.25806452 12.7505183 7.25806452 16.8305646'
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='0 8.58870968 7.25806452 12.6445567 7.25806452 15.1370162'
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='22.7419355 8.58870968 30 12.7417372 30 16.9537453'
                      transform='translate(26.370968, 12.771227) scale(-1, 1) translate(-26.370968, -12.771227) '
                    />
                    <polygon
                      id='Rectangle'
                      opacity='0.077704'
                      fill={theme.palette.common.black}
                      points='22.7419355 8.58870968 30 12.6409734 30 15.2601969'
                      transform='translate(26.370968, 11.924453) scale(-1, 1) translate(-26.370968, -11.924453) '
                    />
                    <path
                      id='Rectangle'
                      fillOpacity='0.15'
                      fill={theme.palette.common.white}
                      d='M3.04512412,1.86636639 L15,9.19354839 L15,9.19354839 L15,17.1774194 L0,8.58649679 L0,3.5715689 C3.0881846e-16,2.4669994 0.8954305,1.5715689 2,1.5715689 C2.36889529,1.5715689 2.73060353,1.67359571 3.04512412,1.86636639 Z'
                    />
                    <path
                      id='Rectangle'
                      fillOpacity='0.35'
                      fill={theme.palette.common.white}
                      transform='translate(22.500000, 8.588710) scale(-1, 1) translate(-22.500000, -8.588710) '
                      d='M18.0451241,1.86636639 L30,9.19354839 L30,9.19354839 L30,17.1774194 L15,8.58649679 L15,3.5715689 C15,2.4669994 15.8954305,1.5715689 17,1.5715689 C17.3688953,1.5715689 17.7306035,1.67359571 18.0451241,1.86636639 Z'
                    />
                  </g>
                </g>
              </g>
            </svg>
            <Typography
              variant='h6'
              sx={{
                ml: 3,
                lineHeight: 1,
                fontWeight: 600,
                fontSize: '1.5rem !important'
              }}
            >
              {themeConfig.templateName}
            </Typography>
          </Box>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Welcome to {themeConfig.templateName}!
            </Typography>
            <Typography variant='body2'>Please sign-in to your account and start the adventure</Typography>
          </Box>
          <form autoComplete='off' onSubmit={e => handleLogin(e)}>
            <TextField
              autoFocus
              onChange={handleChange('clcode')}
              value={values.clcode}
              error={errors.includes('clcode')}
              fullWidth
              id='clcode'
              label='Client code'
              sx={{ marginBottom: 4 }}
            />
            <TextField
              autoFocus
              error={errors.includes('username')}
              onChange={handleChange('username')}
              value={values.username}
              required
              fullWidth
              id='username'
              label='Username'
              sx={{ marginBottom: 4 }}
            />
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-password'>Password</InputLabel>
              <OutlinedInput
                label='Password'
                value={values.password}
                required
                id='auth-login-password'
                error={errors.includes('password')}
                onChange={handleChange('password')}
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} aria-label='toggle password visibility'>
                      {showPassword ? <EyeOutline /> : <EyeOffOutline />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'end' }}>
              {/* <Link passHref href='/'>
                <LinkStyled onClick={() => (window.location.href = '/reset-password')}>Forgot Password?</LinkStyled>
              </Link> */}
            </Box>
            <Button fullWidth size='large' variant='contained' sx={{ marginBottom: 7 }} type='submit'>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default LoginPage
