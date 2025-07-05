// ** Types Imports
import { Icon } from '@mui/material'
import { useState } from 'react'
import { ThemeColor } from 'src/@core/layouts/types'
import { TableHeaderStatCardProps } from 'src/lib/interfaces'
import { FeesTypesResponse } from 'src/lib/types'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons from 'src/utils/icons'

import {
  Card,
  Chip,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from 'src/utils/muiElements'

interface RowType {
  designation: string
  email: string
  name: string
  src?: string
  role: string
  status: number
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const rows: RowType[] = []

const statusObj: StatusObj = {
  1: { color: ThemeColorEnum.Success },
  0: { color: ThemeColorEnum.Warning }
}

const salesData: TableHeaderStatCardProps[] = [
  {
    value: '245k',
    title: 'Sales',
    color: ThemeColorEnum.Primary,
    icon: <GetChaarvyIcons iconName='AbTesting' fontSize={ChaarvyIconFontSize.lg} />
  },
  {
    value: '12.5k',
    title: 'Customers',
    color: ThemeColorEnum.Success,
    icon: <GetChaarvyIcons iconName='AbTesting' fontSize={ChaarvyIconFontSize.lg} />
  }
]
const Roles = () => {
  const [selectedRole, setSelectedRole] = useState<string>()

  const getKebabOptions = (role_id: string) => {
    return [
      {
        id: role_id,
        label: 'Edit',
        onOptionClick: () => setSelectedRole(role_id)
      }
    ]
  }
  return (
    <>
      {TableTilteHeader({
        title: 'Roles',
        stats: salesData,
        buttonTitle: 'Create Role',
        onButtonClick: () => alert('create Role')
      })}
      <Paper>
        <Card>
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <GetChaarvyIcons iconName='Pencil' fontSize='1.25rem' />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: RowType) => (
                  <TableRow hover key={row.name} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell>{row.designation}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status == 1 ? 'Active' : 'Inactive'}
                        color={statusObj[row.status].color}
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          '& .MuiChip-label': { fontWeight: 500 }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <DropDownMenu
                        dropDownMenuOptions={[
                          {
                            id: 'option-1',
                            label: 'View Details',
                            onOptionClick: () => alert('Option clicked')
                          }
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Paper>
    </>
  )
}

export default Roles
