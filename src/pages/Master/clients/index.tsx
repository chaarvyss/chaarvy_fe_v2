// ** Types Imports
import { Button, Checkbox, FormControlLabel, FormGroup, Grid, IconButton, TextField, Typography } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Permissions } from 'src/constants/permissions'
import { InputVariants } from 'src/lib/enums'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useCreateUpdateRoleMutation } from 'src/store/services/adminServices'
import { useLazyGetRolesListQuery, useLazyGetRolePermissionsListQuery } from 'src/store/services/listServices'
import { ClientsResponse, useGetClientsListQuery } from 'src/store/services/MasterServices/adminServices'
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
  role_name: string
  role_id: string
  status?: number
}

interface ClientRequestData {
  client_name: string
  db_name: string
  college_name: string
  college_code: string
  processing_fees: number
  contact_numbers: Array<string>
  email_id: string
}

const Clients = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>()
  const { data: clientsListData } = useGetClientsListQuery()

  const [showCreateOrEditRoleModal, setShowCreateOrEditRoleModal] = useState<boolean>(false)

  const [createUpdateRole] = useCreateUpdateRoleMutation()

  const { triggerToast } = useToast()

  const addUpdateClient = () => {
    return (
      <ChaarvyModal title='Create Update Client' isOpen={true} onClose={() => {}}>
        <p>asdf</p>
      </ChaarvyModal>
    )
  }

  return (
    <>
      {TableTilteHeader({
        title: 'Clients',
        buttonTitle: 'Add Client',
        onButtonClick: () => setShowCreateOrEditRoleModal(true)
      })}
      <Paper>
        {addUpdateClient()}
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
