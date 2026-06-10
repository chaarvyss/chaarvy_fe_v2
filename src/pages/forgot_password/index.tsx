import { CardProps, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from 'react'

import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import {
  useResetPasswordMutation,
  useLazyRequestResetCodeQuery,
  useLazyVerifyResetCodeQuery
} from 'src/store/services/authServices'
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
  TextField
} from 'src/utils/muiElements'
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

// ** Interfaces
interface ResetPasswordState {
  clcode: string
  username: string
  verification_code: string
  newPassword: string
  confirmPassword: string
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const ResetPasswordPage = () => {
  const { setLoading } = useLoader()
  const router = useRouter()
  const { triggerToast } = useToast()

  // ** API Hooks
  const [requestCode, { isFetching: isRequesting }] = useLazyRequestResetCodeQuery()
  const [verifyCode, { isFetching: isVerifying }] = useLazyVerifyResetCodeQuery()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  // ** State
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [values, setValues] = useState<ResetPasswordState>({
    clcode: '',
    username: '',
    verification_code: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Array<string>>([])
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const [blockingError, setBlockingError] = useState<string>()

  // Sync loading state with context for all API calls
  useEffect(() => {
    setLoading(isRequesting || isVerifying || isResetting)
  }, [isRequesting, isVerifying, isResetting, setLoading])

  const handleChange = (prop: keyof ResetPasswordState) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
    if (errors.includes(prop)) {
      setErrors(errors.filter(err => err !== prop))
    }
    setBlockingError(undefined)
  }

  // ** Step 1: Request Code Handler
  const handleRequestCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const step1Errors: string[] = []
    if (!values.clcode) step1Errors.push('clcode')
    if (!values.username) step1Errors.push('username')

    if (step1Errors.length > 0) {
      setErrors(step1Errors)

      return
    }

    // Fire API to request the reset code to email
    requestCode({
      clcode: values.clcode,
      username: values.username
    })
      .unwrap()
      .then(e => {
        triggerToast(e, { variant: ToastVariants.SUCCESS })
        setStep(2)
      })
      .catch(e => {
        setBlockingError(e?.data)
      })
  }

  // ** Step 2: Verify Code Handler
  const handleVerifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const step2Errors: string[] = []
    if (!values.verification_code) step2Errors.push('verification_code')

    if (step2Errors.length > 0) {
      setErrors(step2Errors)

      return
    }

    verifyCode({
      clcode: values.clcode,
      username: values.username,
      verification_code: values.verification_code
    })
      .unwrap()
      .then(() => {
        triggerToast('Code verified successfully.', { variant: ToastVariants.SUCCESS })
        setStep(3)
      })
      .catch(e => {
        setBlockingError(e?.data)
      })
  }

  // ** Step 3: Reset Password Handler
  const handleResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const step3Errors: string[] = []
    if (!values.newPassword) step3Errors.push('newPassword')
    if (!values.confirmPassword) step3Errors.push('confirmPassword')

    if (step3Errors.length > 0) {
      setErrors(step3Errors)

      return
    }

    if (values.newPassword !== values.confirmPassword) {
      triggerToast('Passwords do not match', { variant: ToastVariants.ERROR })
      setErrors(['newPassword', 'confirmPassword'])

      return
    }

    resetPassword({
      clcode: values.clcode,
      username: values.username,
      password: values.newPassword
    })
      .unwrap()
      .then(() => {
        triggerToast('Password reset successfully! Please login.', { variant: ToastVariants.SUCCESS })
        router.push('/login')
      })
      .catch(e => {
        triggerToast(e?.data || 'Failed to reset password', { variant: ToastVariants.ERROR })
      })
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Reset Password 🔒
            </Typography>
            <Typography variant='body2'>
              {step === 1 && 'Enter your client code and username to receive a reset link.'}
              {step === 2 && 'Please enter the verification code sent to your email.'}
              {step === 3 && 'Code verified! Please create your new password.'}
            </Typography>
          </Box>

          <form
            autoComplete='off'
            onSubmit={step === 1 ? handleRequestCode : step === 2 ? handleVerifyCode : handleResetPassword}
          >
            {/* --- STEP 1 UI --- */}
            {step === 1 && (
              <>
                <TextField
                  autoFocus
                  fullWidth
                  id='clcode'
                  label='Client Code'
                  value={values.clcode}
                  onChange={handleChange('clcode')}
                  error={errors.includes('clcode')}
                  sx={{ marginBottom: 4 }}
                />

                <TextField
                  fullWidth
                  id='username'
                  label='Username'
                  value={values.username}
                  onChange={handleChange('username')}
                  error={errors.includes('username')}
                  sx={{ marginBottom: 6 }}
                />
              </>
            )}

            {/* --- STEP 2 UI --- */}
            {step === 2 && (
              <TextField
                autoFocus
                fullWidth
                id='verification_code'
                label='Verification Code'
                value={values.verification_code}
                onChange={handleChange('verification_code')}
                error={errors.includes('verification_code')}
                sx={{ marginBottom: 6 }}
              />
            )}

            {/* --- STEP 3 UI --- */}
            {step === 3 && (
              <>
                <FormControl fullWidth sx={{ marginBottom: 4 }}>
                  <InputLabel htmlFor='new-password' error={errors.includes('newPassword')}>
                    New Password
                  </InputLabel>
                  <OutlinedInput
                    id='new-password'
                    label='New Password'
                    value={values.newPassword}
                    onChange={handleChange('newPassword')}
                    error={errors.includes('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label='toggle new password visibility'
                        >
                          {showNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>

                <FormControl fullWidth sx={{ marginBottom: 6 }}>
                  <InputLabel htmlFor='confirm-password' error={errors.includes('confirmPassword')}>
                    Confirm Password
                  </InputLabel>
                  <OutlinedInput
                    id='confirm-password'
                    label='Confirm Password'
                    value={values.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    error={errors.includes('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label='toggle confirm password visibility'
                        >
                          {showConfirmPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button size='small' variant='contained' type='submit'>
                {step === 1 ? 'Request Code' : step === 2 ? 'Verify Code' : 'Set New Password'}
              </Button>
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant='text'
                onClick={() => {
                  if (step === 3) setStep(2)
                  else if (step === 2) setStep(1)
                  else router.push('/login')
                }}
              >
                {step === 1 ? 'Back to Login' : 'Back'}
              </Button>
            </Box>
          </form>
          <Typography color='red' fontSize='14px'>
            {blockingError}
          </Typography>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  )
}

ResetPasswordPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ResetPasswordPage
