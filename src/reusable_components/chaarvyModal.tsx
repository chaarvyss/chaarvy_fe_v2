import { Close } from '@mdiElements'
import { Box, Button, Card, CardContent, Grid, Modal, Typography } from '@muiElements'
import React, { ReactChild, useState } from 'react'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: 24,
  bgColor: 'white'
}

interface ChaarvyModalProps {
  children: ReactChild
  footer?: ReactChild
  isOpen: boolean
  shouldWarnOnClose?: boolean
  shouldRestrictCloseOnOuterClick?: boolean
  onClose: () => void
  title?: string
}

const ChaarvyModal = ({
  isOpen,
  onClose,
  children,
  footer,
  shouldWarnOnClose,
  shouldRestrictCloseOnOuterClick,
  title
}: ChaarvyModalProps) => {
  const [isWarnOnCloseOpen, setIsWarnOnCloseOpen] = useState<boolean>(false)

  const WarnOnCloseModal = () => {
    return (
      <Modal open={isWarnOnCloseOpen}>
        <Grid item xs={12} md={6}>
          <Card sx={{ ...style, padding: 3, gap: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
              <Typography variant='h5'>Warning</Typography>
            </Box>
            <Box sx={{ padding: 2 }}>
              <Typography variant='body1'>Are you sure want to close this modal?</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
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
          </Card>
        </Grid>
      </Modal>
    )
  }

  const handleModalClose = () => {
    if (shouldWarnOnClose) {
      setIsWarnOnCloseOpen(true)
    } else {
      onClose()
    }
  }

  return (
    <>
      <Modal open={isOpen} {...(!!shouldRestrictCloseOnOuterClick ? {} : { onClose: handleModalClose })}>
        <Card sx={style}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 4 }}>
            <Typography variant='h5'>{title}</Typography>
            <Close onClick={handleModalClose} sx={{ cursor: 'pointer' }} />
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
