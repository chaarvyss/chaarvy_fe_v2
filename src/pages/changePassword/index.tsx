import { CardProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, ReactNode, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { PagePath } from 'src/constants/pagePathConstants'
import { getEmptyKeysList } from 'src/lib/helpers'
import { ChangePasswordProps } from 'src/lib/interfaces'
import { useChangePasswordMutation } from 'src/store/services/authServices'
import { Box, Button, CardContent, MuiCard, TextField, Typography } from 'src/utils/muiElements'
import CommonAuthPage from 'src/views/Auth'
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const ChangePassword = () => {
  const [values, setValues] = useState<ChangePasswordProps>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Array<string>>([])

  const router = useRouter()

  const [changePassword] = useChangePasswordMutation()
  const { triggerToast } = useToast()

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let emptyKeys = getEmptyKeysList(values)

    if (values.confirmPassword !== values.newPassword) {
      emptyKeys = [...emptyKeys, 'passwordMismatch', 'newPassword', 'confirmPassword']
    }

    if (emptyKeys?.length == 0) {
      changePassword(values)
        .unwrap()
        .then(e => {
          triggerToast(e, { variant: ToastVariants.SUCCESS })
          sessionStorage.clear()
          router.push(PagePath.LOGIN_PAGE)
        })
        .catch(e => {
          triggerToast(e?.data, { variant: ToastVariants.ERROR })
        })
    }
    setErrors(emptyKeys)
  }

  const handleChange = (prop: keyof ChangePasswordProps) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <CommonAuthPage />
          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Change Password
            </Typography>
          </Box>
          <form autoComplete='off' onSubmit={e => handleLogin(e)}>
            <TextField
              autoFocus
              onChange={handleChange('oldPassword')}
              value={values.oldPassword}
              error={errors.includes('oldPassword')}
              fullWidth
              type='password'
              id='oldPassword'
              label='Old Password'
              sx={{ marginBottom: 4 }}
            />
            <TextField
              autoFocus
              error={errors.includes('newPassword')}
              onChange={handleChange('newPassword')}
              value={values.newPassword}
              required
              fullWidth
              type='password'
              id='newPassword'
              label='New Password'
              sx={{ marginBottom: 4 }}
            />

            <TextField
              autoFocus
              error={errors.includes('confirmPassword')}
              onChange={handleChange('confirmPassword')}
              value={values.confirmPassword}
              required
              fullWidth
              type='password'
              id='confirmPassword'
              label='Confirm Password'
            />

            {errors.includes('passwordMismatch') && (
              <Typography variant='body2' color='red'>
                password not matching
              </Typography>
            )}

            <Button fullWidth size='large' variant='contained' sx={{ marginBottom: 7, marginTop: 4 }} type='submit'>
              Change Password
            </Button>
          </form>
        </CardContent>
        <FooterIllustrationsV1 />
      </Card>
    </Box>
  )
}

ChangePassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ChangePassword
