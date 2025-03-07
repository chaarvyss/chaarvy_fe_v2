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
import React, { useEffect } from 'react'
import { useLoader } from 'src/@core/context/loaderContext'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { PagePath } from 'src/constants/pagePathConstants'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useLazyGetAdmissionsListQuery } from 'src/store/services/admisissionsService'
import { statusColors } from 'src/utils/constants'
import GetChaarvyIcons from 'src/utils/icons'
import RenderAdmissionFilterOptions, { RenderAdmissionsFilters } from './filters'

const Admissions = () => {
  const router = useRouter()
  const { openDrawer } = useSideDrawer()
  const { setLoading } = useLoader()
  const [fetchAdmissions, { data: admissions, isLoading }] = useLazyGetAdmissionsListQuery()

  useEffect(() => {
    fetchAdmissions(undefined)
  }, [])

  setLoading(isLoading)
  const handleCreateAdmissionClick = () => {
    router.push(PagePath.CREATE_ADMISSION)
  }

  const getKebabOptions = (application_id: string) => {
    return [
      {
        id: 'edit application',
        label: 'Edit Application',
        icon: <GetChaarvyIcons iconName='GreasePencil' />,
        onOptionClick: () => router.push(`${PagePath.CREATE_ADMISSION}?id=${application_id}`)
      }
    ]
  }

  const handleFilteredAdmissions = (params?: RenderAdmissionsFilters) => {
    params && fetchAdmissions(params)
  }

  const onFilterButtonClick = () => {
    openDrawer('Filters', <RenderAdmissionFilterOptions onSubmit={handleFilteredAdmissions} />)
  }

  return (
    <>
      {TableTilteHeader({
        title: 'Admissions',
        buttonTitle: 'New Admission',
        onButtonClick: handleCreateAdmissionClick,
        showFilterIcon: true,
        handleFilterButtonClick: onFilterButtonClick
      })}
      <Paper>
        <Card>
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Father Name</TableCell>
                  <TableCell>Date of Birth</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(admissions ?? []).map(
                  ({
                    photo_url,
                    admission_number,
                    dob,
                    father_name,
                    city,
                    program_name,
                    application_id,
                    contact_no_1,
                    student_name
                  }) => (
                    <TableRow hover key={application_id}>
                      <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                          <Avatar src={photo_url} />
                          <Box sx={{ flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>
                              {student_name}
                            </Typography>
                            <Typography variant='caption'>{admission_number}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{father_name}</TableCell>
                      <TableCell>{dob}</TableCell>
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
                      </TableCell>
                      <TableCell>{city}</TableCell>
                      <TableCell>{contact_no_1}</TableCell>
                      <TableCell width='10px'>
                        <DropDownMenu dropDownMenuOptions={getKebabOptions(application_id)} />
                      </TableCell>
                    </TableRow>
                  )
                )}
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
