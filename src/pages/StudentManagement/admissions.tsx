import {
  Avatar,
  Box,
  Card,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@muiElements'
import { useRouter } from 'next/router'
import React from 'react'
import { PagePath } from 'src/constants/pagePathConstants'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader, { TableTitleHeaderProps } from 'src/reusable_components/TableTilteHeader'
import { useGetAdmissionsListQuery } from 'src/store/services/admisissionsService'
import { statusColors } from 'src/utils/constants'

const Admissions = () => {
  const router = useRouter()
  const { data: admissions } = useGetAdmissionsListQuery()

  const handleCreateAdmissionClick = () => {
    router.push(PagePath.CREATE_ADMISSION)
  }

  return (
    <>
      {TableTilteHeader({
        title: 'Admissions',
        buttonTitle: 'Create Admission',
        onButtonClick: handleCreateAdmissionClick
      })}
      <Paper>
        <Card>
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>S#</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(admissions ?? []).map(({ photo_url, program_name, application_id, contact_no_1, student_name }) => (
                  <TableRow hover key={application_id}>
                    <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                        <Avatar src={photo_url} />
                        <Box sx={{ flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>
                            {student_name}
                          </Typography>
                          <Typography variant='caption'>{contact_no_1}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{program_name}</TableCell>
                    <TableCell>
                      <Chip
                        label='Active'
                        color={statusColors.active}
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          '& .MuiChip-label': { fontWeight: 500 }
                        }}
                      />
                      {/* <Chip
                        label={user.active === 1 ? 'Active' : 'Inactive'}
                        color={user.active === 1 ? statusColors.active : statusColors.inactive}
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          '& .MuiChip-label': { fontWeight: 500 }
                        }}
                      /> */}
                    </TableCell>

                    <TableCell width='10px'>
                      <DropDownMenu dropDownMenuOptions={[]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(admissions ?? []).length == 0 && (
              <Box justifyContent='center' alignItems='center' paddingBottom='2rem'>
                <Typography variant='h6' textAlign='center'>
                  No Admissions
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Card>
      </Paper>
    </>
  )
}

export default Admissions
