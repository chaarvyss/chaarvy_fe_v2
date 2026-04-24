import { CardProps } from '@mui/material'

import { Card } from '@muiElements'

interface CardButtonProps {
  children: React.ReactNode
  onClick: () => void
  size?: 'micro' | 'small' | 'medium' | 'large'
  className?: CardProps['sx']
}

const sizeMap = {
  micro: 200,
  small: 250,
  medium: 300,
  large: 350
}

const baseStyles = {
  cursor: 'pointer',
  width: { xs: '100%' },
  borderRadius: '1rem',
  padding: 4,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}

const CardButton = ({ children, onClick, size = 'small', className = {} }: CardButtonProps) => (
  <Card
    onClick={onClick}
    sx={{
      ...baseStyles,
      width: { xs: '100%', sm: `${sizeMap[size]}px` },
      ...className
    }}
  >
    {children}
  </Card>
)

export default CardButton
