import { Box, Button } from '@muiElements'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useLazyGetGoogleAuthUrlQuery, useLazyIntegrationCallbackQuery } from 'src/store/services/calenderServices'

const CalenderIntegration = () => {
  const router = useRouter()
  const [getIntegrationUrl] = useLazyGetGoogleAuthUrlQuery()
  const [integrateCallBack] = useLazyIntegrationCallbackQuery()

  // http://localhost:3000/calendar/integration/?
  // state=1rhtbhdPPT2wyUaGrVJwCxwxYRmchX&
  // code=4/0AQSTgQFJrEDC2lw431fDBv5ZhxCwShDArrOFsKbPO3T2-C-9jbBAWPq6WUWSGRpabg4l9Q&
  // scope=https://www.googleapis.com/auth/calendar

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      const code = queryParams.get('code')

      if (code !== null) {
        integrateCallBack(code)
          .unwrap()
          .then(() => router.push('/dashboard'))
      }
    }
  }, [])

  const handleLogin = async () => {
    const result = await getIntegrationUrl().unwrap()
    if (result.auth_url) {
      window.location.href = result.auth_url
    } else {
      console.error('Failed to get auth URL')
    }
  }

  return (
    <Box>
      <Button onClick={handleLogin}>Integrage</Button>
    </Box>
  )
}

export default CalenderIntegration
