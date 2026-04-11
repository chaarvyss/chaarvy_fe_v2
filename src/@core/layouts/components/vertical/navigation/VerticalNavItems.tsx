// ** Types Import
import Collapse from '@mui/material/Collapse'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { Box } from '@muiElements'
import { Settings } from 'src/@core/context/settingsContext'
import { NavLink, NavSectionTitle, VerticalNavItemsType } from 'src/@core/layouts/types'
import { handleURLQueries } from 'src/@core/layouts/utils'

// ** Custom Menu Components
import VerticalNavLink from './VerticalNavLink'
import VerticalNavSectionTitle from './VerticalNavSectionTitle'

interface Props {
  settings: Settings
  navVisible?: boolean
  groupActive: string[]
  currentActiveGroup: string[]
  verticalNavItems?: VerticalNavItemsType
  saveSettings: (values: Settings) => void
  setGroupActive: (value: string[]) => void
  setCurrentActiveGroup: (item: string[]) => void
  depth?: number
}

const isNavLinkActive = (item: NavLink, router: ReturnType<typeof useRouter>) => {
  if (item.path && (router.pathname === item.path || handleURLQueries(router, item.path))) {
    return true
  }

  return item.children?.some(child => isNavLinkActive(child, router)) ?? false
}

interface VerticalNavItemProps extends Omit<Props, 'verticalNavItems'> {
  item: NavLink
  depth: number
}

const VerticalNavItem = (props: VerticalNavItemProps) => {
  const { item, depth, ...rest } = props
  const router = useRouter()
  const [open, setOpen] = useState<boolean>(false)
  const active = isNavLinkActive(item, router)

  useEffect(() => {
    if (active && item.children?.length) {
      setOpen(true)
    }
  }, [active, item.children])

  const toggleOpen = () => {
    setOpen(prev => !prev)
  }

  return (
    <Box key={item.key ?? item.title} borderRadius='1rem'>
      <VerticalNavLink
        {...rest}
        item={item}
        depth={depth}
        hasChildren={!!item.children?.length}
        open={open}
        toggleOpen={toggleOpen}
        active={active}
      />
      {item.children?.length ? (
        <Collapse in={open} timeout='auto' unmountOnExit>
          <Box sx={{ pl: 4 }}>
            <VerticalNavItems {...rest} verticalNavItems={item.children} depth={depth + 1} />
          </Box>
        </Collapse>
      ) : null}
    </Box>
  )
}

const VerticalNavItems = (props: Props) => {
  // ** Props
  const { verticalNavItems, depth = 0 } = props

  const RenderMenuItems = verticalNavItems?.map((item: NavLink | NavSectionTitle, index: number) => {
    if ((item as NavSectionTitle).sectionTitle) {
      return (
        <Box key={`${(item as NavSectionTitle).sectionTitle}-${index}`} borderRadius='1rem'>
          <VerticalNavSectionTitle item={item as NavSectionTitle} />
        </Box>
      )
    }

    return <VerticalNavItem {...props} key={item.key} item={item as NavLink} depth={depth} />
  })

  return <>{RenderMenuItems}</>
}

export default VerticalNavItems
