import React, { ReactChild, useState } from 'react'

import { Close } from '@mdiElements'
import { Box, Button, Card, CardContent, Grid, Modal, Typography } from '@muiElements'
import { useSettings } from 'src/@core/hooks/useSettings'

const lightBgColors = `
    linear-gradient(to bottom, #cccccc, #ffffff),   /* top */
    linear-gradient(to bottom, #ffffff, #cccccc),      /* bottom */
    linear-gradient(to right, #cccccc, #ffffff),    /* left */
    linear-gradient(to right, #ffffff, #cccccc)      /* right */
  `

const darkBgColors = `
    linear-gradient(to bottom, #ffffff, #272545),   /* top */
    linear-gradient(to bottom, #272545, #ffffff),      /* bottom */
    linear-gradient(to left, #272545, #1e1b3f),    /* left */
    linear-gradient(to right,#272545, #1e1b3f)      /* right */
  `

const baseStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: 24,

  maxHeight: '90vh',
  overflow: 'auto',

  backgroundImage: lightBgColors,
  backgroundSize: `
    100% 8px,   /* top */
    100% 8px,   /* bottom */
    8px 100%,   /* left */
    8px 100%    /* right */
  `,
  backgroundPosition: `
    top,
    bottom,
    left,
    right
  `,
  backgroundRepeat: 'no-repeat'
}

interface ChaarvyModalProps {
  children: ReactChild
  footer?: ReactChild
  isOpen: boolean
  modalSize?: string
  onClose?: () => void
  shouldWarnOnClose?: boolean
  shouldRestrictCloseOnOuterClick?: boolean
  title?: string
}

const ChaarvyModal = ({
  isOpen,
  children,
  footer,
  modalSize,
  onClose,
  shouldWarnOnClose,
  shouldRestrictCloseOnOuterClick,
  title
}: ChaarvyModalProps) => {
  const { settings } = useSettings()

  const style = {
    ...baseStyle,
    backgroundImage: settings.mode === 'light' ? lightBgColors : darkBgColors
  }
  const [isWarnOnCloseOpen, setIsWarnOnCloseOpen] = useState<boolean>(false)

  const WarnOnCloseModal = () => {
    return (
      <Modal open={isWarnOnCloseOpen} sx={{ backgroundImage: 'linear-gradientBox(to top,red,blue)' }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ ...style, padding: 3, gap: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
              <Typography variant='h5'>Warning</Typography>
            </Box>
            <Box sx={{ padding: 2 }}>
              <Typography variant='body1'>Are you sure want to close this modal?</Typography>
            </Box>
            {onClose && (
              <Box gap={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                <Button variant='outlined' color='error' onClick={() => setIsWarnOnCloseOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={() => {
                    setIsWarnOnCloseOpen(false)
                    onClose()
                  }}
                >
                  Confirm
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Modal>
    )
  }

  const handleModalClose = () => {
    if (shouldWarnOnClose) {
      setIsWarnOnCloseOpen(true)
    } else {
      onClose?.()
    }
  }

  const getModalSize = () => {
    return modalSize ?? 'col-12 col-md-6 col-lg-4'
  }

  return (
    <>
      {/* <Modal open={isOpen} {...(!!shouldRestrictCloseOnOuterClick ? {} : { onClose: handleModalClose?.() })}> */}
      <Modal open={isOpen} onClose={shouldRestrictCloseOnOuterClick ? undefined : handleModalClose}>
        <Card className={getModalSize()} sx={style}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 4,
              overFlow: 'auto',
              height: '100%'
            }}
          >
            <Typography variant='h5'>{title}</Typography>
            {onClose && <Close onClick={handleModalClose} sx={{ cursor: 'pointer' }} />}
          </Box>
          <CardContent sx={{ p: 3 }}>{children}</CardContent>
          {footer && (
            <Box padding={1} marginBottom={4}>
              {footer}
            </Box>
          )}
        </Card>
      </Modal>
      {WarnOnCloseModal()}
    </>
  )
}

export default ChaarvyModal
