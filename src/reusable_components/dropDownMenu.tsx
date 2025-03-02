import { Fragment, ReactElement, SyntheticEvent, useState } from 'react'

import GetChaarvyIcons from 'src/utils/icons'
import { Box, IconButton, Menu, MenuItem, Typography } from 'src/utils/muiElements'

interface DropDownMenuProps {
  id: string
  label: string
  icon?: ReactElement
  onOptionClick: () => void
}

export const filterFalseAndInvalid = (options: any[]): DropDownMenuProps[] => {
  return options.filter(each => each !== false && each !== undefined)
}

const DropDownMenu = ({ dropDownMenuOptions }: { dropDownMenuOptions: DropDownMenuProps[] }) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  if (!dropDownMenuOptions || dropDownMenuOptions.length === 0) return null

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      fontSize: '1.375rem',
      color: 'text.secondary'
    }
  }

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <Fragment>
      <IconButton onClick={handleDropdownOpen}>
        <GetChaarvyIcons iconName='DotsVertical' />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 0 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {dropDownMenuOptions.map(each => (
          <MenuItem
            key={each.id}
            sx={{ p: 0 }}
            onClick={() => {
              handleDropdownClose()
              each?.onOptionClick()
            }}
          >
            <Box sx={styles}>
              {each?.icon}
              <Typography sx={{ ml: 1 }}>{each.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Fragment>
  )
}

export default DropDownMenu
