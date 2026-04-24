import { CardProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import themeConfig from 'src/configs/themeConfig'
import { MASTER_TYPE } from 'src/constants/constants'
import { PagePath } from 'src/constants/pagePathConstants'
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
import CommonAuthPage from 'src/views/Auth'
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

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
    if (sessionStorage.getItem(sessionStorageKeys.accessToken)) {
      router.push(PagePath.DASHBOARD)
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
          const { clcode, name, authToken, role, permission } = res.data

          dispatch(setAvailablePermissionsData(permission))
          triggerToast('Login Successful', { variant: ToastVariants.SUCCESS })
          localStorage.setItem(sessionStorageKeys.clientCode, clcode)
          saveSettings({ ...settings, current_username: name })
          sessionStorage.setItem(sessionStorageKeys.accessToken, authToken)
          sessionStorage.setItem(sessionStorageKeys.clientCode, clcode)
          sessionStorage.setItem('role', role)
          if (clcode == MASTER_TYPE) {
            router.push(PagePath.MASTER_DASHBOARD)
          } else {
            router.push(PagePath.DASHBOARD)
          }
        })
        .catch(e => {
          triggerToast(e?.data, { variant: ToastVariants.ERROR })
        })
    }
    setErrors(emptyKeys)
  }

  const [showPassword, setShowPassword] = useState<boolean>(false)

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
          <CommonAuthPage />
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
