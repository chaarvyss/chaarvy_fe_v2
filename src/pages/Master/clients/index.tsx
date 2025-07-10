import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { ClientsResponse, useGetClientsListQuery } from 'src/store/services/MasterServices/adminServices'

import { Card, Paper, TableContainer, Table, TableBody, TableCell, TableHead, TableRow } from 'src/utils/muiElements'
import CreateClient from './createClient'

const Clients = () => {
  const { data: clientsListData } = useGetClientsListQuery()
  const { openDrawer } = useSideDrawer()

  const handleEdit = data => {
    openDrawer('Edit Client', <CreateClient clientDetails={data} />)
  }

  return (
    <>
      {TableTilteHeader({
        title: 'Clients',
        buttonTitle: 'Add Client',
        onButtonClick: () => openDrawer('New Client', <CreateClient />)
      })}
      <Paper>
        <Card>
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>College Code</TableCell>
                  <TableCell>College Name</TableCell>
                  <TableCell>DB Name</TableCell>
                  <TableCell>Inst Type</TableCell>
                  <TableCell>Processing Fees</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(clientsListData ?? []).map((row: ClientsResponse, index: number) => (
                  <TableRow hover key={row.client_id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.client_name}</TableCell>
                    <TableCell>{row.college_code}</TableCell>
                    <TableCell>{row.college_name}</TableCell>
                    <TableCell>{row.db_name}</TableCell>
                    <TableCell>{row.inst_type}</TableCell>
                    <TableCell>{row.processing_fees}</TableCell>
                    <TableCell onClick={() => handleEdit(row)}>edit</TableCell>
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

export default Clients
