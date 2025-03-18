import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Box, IconButton } from '@mui/material'
import { useImageViewer } from 'src/@core/context/imageViewerContext'
import GetChaarvyIcons from 'src/utils/icons'

const ImageViewer = ({ imageUrl }: { imageUrl: string }) => {
  const { setShowImage } = useImageViewer()
  return (
    <div
      style={{ zIndex: 9999, position: 'relative' }}
      className='position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50'
    >
      <TransformWrapper>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div style={{ textAlign: 'center' }}>
            {/* Zoom Controls */}
            <div style={{ marginBottom: '10px' }}>
              <Box
                gap={1}
                className='bg-info rounded'
                style={{
                  position: 'absolute',
                  right: '5%',
                  top: '3vh',
                  display: 'flex'
                }}
              >
                <IconButton className='card-more-options' onClick={() => zoomIn()}>
                  <GetChaarvyIcons color='white' iconName='MagnifyPlusOutline' />
                </IconButton>
                <IconButton onClick={() => zoomOut()} style={{ marginRight: '5px' }}>
                  <GetChaarvyIcons color='white' iconName='MagnifyMinusOutline' />
                </IconButton>
                <IconButton onClick={() => resetTransform()}>
                  <GetChaarvyIcons color='white' iconName='LockReset' />
                </IconButton>
                <IconButton onClick={() => setShowImage?.('')}>
                  <GetChaarvyIcons color='white' iconName='Close' />
                </IconButton>
              </Box>
            </div>

            {/* Zoomable & Pannable Image */}
            <TransformComponent>
              <img src={imageUrl} alt='Zoomable' style={{ maxWidth: '100%', height: '80vh' }} />
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  )
}

export default ImageViewer
