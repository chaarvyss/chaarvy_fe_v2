import { SxProps } from '@mui/material'

import { Box } from '@muiElements'

const ChaarvyFlex = ({ children, className }: { children: React.ReactNode; className?: SxProps }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        ...className
      }}
    >
      {children}
    </Box>
  )
}

export default ChaarvyFlex
