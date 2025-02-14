// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'
import { TableHeaderStatCardProps } from 'src/lib/interfaces'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { ChaarvyIcon, ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons from 'src/utils/icons'
import { AccountOutline } from 'src/utils/mdiElements'
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

const rows: RowType[] = [
  {
    status: 1,
    name: 'Sally Quinn',
    role: '$19586.23',
    email: 'eebsworth2m@sbwire.com',
    designation: 'Human Resources Assistant'
  }
]

const statusObj: StatusObj = {
  1: { color: ThemeColorEnum.Success },
  0: { color: ThemeColorEnum.Warning }
}

const salesData: TableHeaderStatCardProps[] = [
  {
    value: '245k',
    title: 'Sales',
    color: ThemeColorEnum.Primary,
    icon: GetChaarvyIcons({ iconName: ChaarvyIcon.TrendingUp, fontSize: ChaarvyIconFontSize.lg })
  },
  {
    value: '12.5k',
    title: 'Customers',
    color: ThemeColorEnum.Success,
    icon: GetChaarvyIcons({ iconName: ChaarvyIcon.AbTesting })
  },
  {
    value: '1.54k',
    color: ThemeColorEnum.Warning,
    title: 'Products',
    icon: GetChaarvyIcons({ iconName: ChaarvyIcon.CellphoneLink })
  },
  {
    value: '$88k',
    color: ThemeColorEnum.Info,
    title: 'Revenue',
    icon: GetChaarvyIcons({ iconName: ChaarvyIcon.CurrencyUsd })
  }
]
const Roles = () => {
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
                  <TableCell>Role name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created by</TableCell>
                  <TableCell></TableCell>
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
