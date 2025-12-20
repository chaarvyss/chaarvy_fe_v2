import { useTheme } from '@mui/material'
import { blue, grey, lightBlue } from '@mui/material/colors'
import React from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@muiElements'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useGetLowStationaryStockDetailsQuery } from 'src/store/services/dashboardServices'

const headers = [
  {
    label: '#'
  },
  {
    label: 'Item'
  },
  {
    label: 'Current Stock'
  }
]

const colors = {
  light: [lightBlue[100], lightBlue[200]],
  dark: [lightBlue[900], lightBlue.A400]
}

const StationaryStock = () => {
  const { settings } = useSettings()
  const theme = useTheme()
  const { data: stockDetails, isLoading } = useGetLowStationaryStockDetailsQuery()

  return (
    <TableContainer>
      {isLoading ? (
        <p>Loading</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: `linear-gradient(to right, ${(settings.mode === 'light' ? colors.light : colors.dark).join(
                  ', '
                )})`,
                borderRadius: '.9rem',
                boxShadow: theme.shadows[8]
              }}
            >
              {headers.map(each => (
                <TableCell
                  key={each.label}
                  sx={{ color: settings.mode === 'light' ? blue[900] : grey[100] }}
                  width='33%'
                >
                  {each.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(stockDetails ?? []).map((each, index) => (
              <TableRow key={each.book_name}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{each.book_name}</TableCell>
                <TableCell>{each.available_quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  )
}

export default StationaryStock
