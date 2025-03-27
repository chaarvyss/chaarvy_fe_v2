import * as MdiIcons from 'mdi-material-ui'
import { SvgIconProps } from '@mui/material'

// Step 1: Extract icon names dynamically
const iconNames = Object.keys(MdiIcons) as (keyof typeof MdiIcons)[]

// Step 2: Generate the Enum dynamically
export const ChaarvyIcon = Object.freeze(Object.fromEntries(iconNames.map(name => [name, name]))) as {
  [K in keyof typeof MdiIcons]: K
}

// Step 3: Map Enum values to actual icon components
const IconsEnum: Record<keyof typeof ChaarvyIcon, React.ComponentType<SvgIconProps>> = MdiIcons

type fontSize = '1.25rem' | '1.5rem' | '1.75rem' | '2rem' | '2.25rem' | '2.5rem'

export interface GetChaarvyIconsProps {
  iconName: keyof typeof ChaarvyIcon
  fontSize?: fontSize
  color?: string
}

const GetChaarvyIcons = ({ iconName, fontSize, color }: GetChaarvyIconsProps) => {
  const IconTag = IconsEnum[iconName]

  if (!IconTag) return null

  const allowedColors = [
    'inherit',
    'primary',
    'secondary',
    'action',
    'disabled',
    'error',
    'info',
    'success',
    'warning'
  ] as const

  const isDefaultColor = allowedColors.includes(color as any)

  return (
    <IconTag
      sx={{
        fontSize: fontSize ?? '1.75rem',
        ...(isDefaultColor ? {} : { color })
      }}
      color={isDefaultColor ? (color as any) : undefined}
    />
  )
}

export default GetChaarvyIcons

export { IconsEnum }
