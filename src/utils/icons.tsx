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

interface GetChaarvyIconsProps {
  iconName: keyof typeof ChaarvyIcon
  fontSize?: string
}

const GetChaarvyIcons = ({ iconName, fontSize }: GetChaarvyIconsProps) => {
  const IconTag = IconsEnum[iconName]

  if (!IconTag) return null // Handle missing icons gracefully

  return <IconTag sx={{ fontSize: fontSize ?? '1.75rem' }} />
}

export default GetChaarvyIcons
export { IconsEnum }
