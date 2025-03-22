import {
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
import React, { useEffect, useState } from 'react'
import { useLoader } from 'src/@core/context/loaderContext'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { PagePath } from 'src/constants/pagePathConstants'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useLazyGetAdmissionsListQuery } from 'src/store/services/admisissionsService'
import { statusColors } from 'src/utils/constants'
import GetChaarvyIcons from 'src/utils/icons'
import RenderFilterOptions from '../../../common/filters'
import { FilterProps } from 'src/lib/interfaces'
import ChaarvyPagination from 'src/reusable_components/Pagination'
import ChaarvyAvatar from 'src/reusable_components/chaarvyAvatar'

const Admissions = () => {
  const router = useRouter()
  const { openDrawer } = useSideDrawer()
  const { setLoading } = useLoader()
  const [fetchAdmissions, { data: admissionResponse, isLoading }] = useLazyGetAdmissionsListQuery()
  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })

  useEffect(() => {
    fetchAdmissions(filterProps)
  }, [filterProps])

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

  const handleFilteredAdmissions = (params?: FilterProps) => {
    fetchAdmissions({ ...filterProps, ...params })
  }

  const onFilterButtonClick = () => {
    openDrawer(
      'Filters',
      <RenderFilterOptions onSubmit={handleFilteredAdmissions} fields={['search', 'program', 'sections']} />
    )
  }

  const admission_stats = [
    {
      value: admissionResponse?.counts?.total ?? 0,
      title: 'Total Admissions',
      color: 'success' as const,
      icon: <GetChaarvyIcons iconName='AccountBoxMultipleOutline' />
    },
    {
      value: admissionResponse?.counts?.filtered ?? 0,
      title: 'Filtered Admissions',
      color: 'info' as const,
      icon: <GetChaarvyIcons iconName='FilterCheckOutline' />
    }
  ]

  return (
    <>
      {TableTilteHeader({
        title: 'Admissions',
        buttonTitle: 'New Admission',
        onButtonClick: handleCreateAdmissionClick,
        showFilterIcon: true,
        stats: admission_stats,
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
                  <TableCell>Phone</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(admissionResponse?.admissions ?? []).map(
                  ({
                    photo_url,
                    admission_number,
                    dob,
                    father_name,
                    program_name,
                    application_id,
                    contact_no_1,
                    student_name
                  }) => (
                    <TableRow hover key={application_id}>
                      <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                          <ChaarvyAvatar src={photo_url} alt={student_name} />
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
                      <TableCell>{contact_no_1}</TableCell>
                      <TableCell width='10px'>
                        <DropDownMenu dropDownMenuOptions={getKebabOptions(application_id)} />
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
            {(admissionResponse?.admissions ?? []).length == 0 && (
              <Box justifyContent='center' alignItems='center' paddingBottom='2rem'>
                <Typography variant='h6' textAlign='center'>
                  No Admissions
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Card>
        <ChaarvyPagination
          total={admissionResponse?.counts?.filtered ?? 0}
          onChange={data => setFilterProps({ ...filterProps, ...data })}
        />
      </Paper>
    </>
  )
}

export default Admissions
