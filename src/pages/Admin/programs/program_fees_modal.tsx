import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@muiElements'
import { Check, Close } from '@mdiElements'
import { SelectChangeEvent, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { TableHeaders } from 'src/lib/interfaces'
import { Fees, Program } from 'src/lib/types'
import ChaarvyAccordian from 'src/reusable_components/chaarvyAccordian'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import {
  CreateProgramFeesRequest,
  useCreateProgramFeesMutation,
  useLazyGetProgramFeesDetailsQuery,
  useUpdateProgramFeesMutation
} from 'src/store/services/feesServices'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { FormControl, Input, InputLabel, MenuItem, Select } from '@mui/material'
import {
  useGetSegmentsListQuery,
  useLazyGetFeesTypesListQuery,
  useLazyGetProgramsListQuery
} from 'src/store/services/listServices'

interface ProgramFeesDetailsProps {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

interface CRUDFees {
  program_fees_id: string
  fees_type: string
  fees?: string | number
}

const ProgramFeesModal = ({ selectedProgram, isOpen, onClose }: ProgramFeesDetailsProps) => {
  const { triggerToast } = useToast()

  const [isCreateProgramFeesModalOpen, setIsCreateProgramFeesModalOpen] = useState<boolean>(false)
  const [feesDetail, setFeesDetail] = useState<CRUDFees>({
    program_fees_id: '',
    fees_type: '',
    fees: undefined
  })

  const [createProgramFeeDetails, setCreateProgramFeesDetails] = useState<CreateProgramFeesRequest>({
    program_id: '',
    fees_type: '',
    fees: 0,
    segment_id: ''
  })

  const [fetchProgramFeesDetails, { data: feesDetails }] = useLazyGetProgramFeesDetailsQuery()
  const [fetchProgramsList, { data: programsList }] = useLazyGetProgramsListQuery()
  const [fetchFeesTypesList, { data: feesTypesList }] = useLazyGetFeesTypesListQuery()
  const { data: segmentsList } = useGetSegmentsListQuery()

  const [updateFeeApi] = useUpdateProgramFeesMutation()
  const [createFeesApi] = useCreateProgramFeesMutation()

  const onCreateProgramFeeClick = () => {
    setCreateProgramFeesDetails({ ...createProgramFeeDetails, program_id: selectedProgram?.program_id ?? '' })
    fetchProgramsList(true)
    fetchFeesTypesList()
    setIsCreateProgramFeesModalOpen(true)
  }
  useEffect(() => {
    fetchProgramFeesDetails({ program_id: selectedProgram?.program_id || '' })
  }, [selectedProgram])

  const headers: TableHeaders[] = [
    { label: 's#' },
    { label: 'Fees Type' },
    { label: 'Fees' },
    { label: 'Actions', width: '100px' }
  ]

  const handleKebabOptionClick = (feeDetail: Fees, option: 'Edit') => {
    switch (option) {
      case 'Edit':
        setCreateProgramFeesDetails({
          ...createProgramFeeDetails,
          segment_id: feeDetail.segment_id,
          program_id: selectedProgram?.program_id ?? ''
        })
        setFeesDetail(feeDetail)
        break
    }
  }

  const getKebabOptions = (feesDetail: Fees) => {
    return [
      {
        id: feesDetail.program_fees_id,
        label: 'Edit',
        onOptionClick: () => handleKebabOptionClick(feesDetail, 'Edit')
      }
    ]
  }

  const handleCancelEdit = () => {
    setFeesDetail({
      program_fees_id: '',
      fees_type: '',
      fees: undefined
    })
  }

  const handleEditFees = () => {
    updateFeeApi({ fees: feesDetail.fees as number, program_fees_id: feesDetail.program_fees_id })
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        handleCancelEdit()
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  const handleFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeesDetail(prev => ({ ...prev, fees: e.target.value }))
  }

  const handleAddProgramFeesModalClose = () => {
    setCreateProgramFeesDetails({
      program_id: '',
      fees_type: '',
      fees: 0,
      segment_id: ''
    })
    setIsCreateProgramFeesModalOpen(false)
  }

  const handleCreateProgramFeesDetalilsUpdate =
    (prop: keyof CreateProgramFeesRequest) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
      setCreateProgramFeesDetails({ ...createProgramFeeDetails, [prop]: event.target.value })
    }

  const isCreateProgramFeesButtonDisabled = (): boolean => {
    return Object.values(createProgramFeeDetails).some(value => value === '' || value === 0)
  }

  const confirmCreateProgramFees = () => {
    createFeesApi(createProgramFeeDetails)
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        handleAddProgramFeesModalClose()
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  const createProgramFeesModal = () => {
    return (
      <ChaarvyModal
        shouldRestrictCloseOnOuterClick
        shouldWarnOnClose
        onClose={handleAddProgramFeesModalClose}
        isOpen={isCreateProgramFeesModalOpen}
        title='Add Program fees'
      >
        <Box gap='1rem'>
          <FormControl fullWidth>
            <InputLabel>Program</InputLabel>
            <Select
              required
              label='Program'
              disabled={!!selectedProgram}
              onChange={handleCreateProgramFeesDetalilsUpdate('program_id')}
              value={createProgramFeeDetails.program_id}
            >
              {(programsList ?? []).map(each => (
                <MenuItem value={each.program_id}>{each.program_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className='mt-3'>
            <InputLabel>Segment</InputLabel>
            <Select
              required
              label='Segment'
              disabled={createProgramFeeDetails.segment_id !== ''}
              onChange={handleCreateProgramFeesDetalilsUpdate('segment_id')}
              value={createProgramFeeDetails.segment_id}
            >
              {(segmentsList ?? []).map(each => (
                <MenuItem value={each.segment_id}>{each.segment_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className='mt-3'>
            <InputLabel>Fees Type</InputLabel>
            <Select
              required
              label='Fees Type'
              onChange={handleCreateProgramFeesDetalilsUpdate('fees_type')}
              value={createProgramFeeDetails.fees_type}
            >
              {(feesTypesList ?? []).map(each => (
                <MenuItem value={each.fees_type_id}>{each.fees_type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className='mt-3'>
            <TextField
              required
              type='number'
              label='Fees'
              value={createProgramFeeDetails.fees}
              onChange={handleCreateProgramFeesDetalilsUpdate('fees')}
            />
          </FormControl>
          <Box marginTop={4} display='flex' justifyContent='space-around' alignItems='center'>
            <Button onClick={handleAddProgramFeesModalClose} variant='outlined' color='error'>
              Cancel
            </Button>
            <Button
              variant='contained'
              disabled={isCreateProgramFeesButtonDisabled()}
              onClick={confirmCreateProgramFees}
            >
              Create
            </Button>
          </Box>
        </Box>
      </ChaarvyModal>
    )
  }

  const showAddProgramFeesButton = (): boolean => {
    return (
      !!feesDetails &&
      !!segmentsList &&
      (feesDetails.segments.length == 0 || feesDetails.segments.length !== segmentsList.length)
    )
  }

  return (
    <>
      <ChaarvyModal
        isOpen={isOpen}
        onClose={onClose}
        title={`${selectedProgram?.program_name} Fees Details`}
        modalSize='col-12 col-md-6'
      >
        <>
          {(feesDetails?.segments || []).map(eachSegment => (
            <ChaarvyAccordian title={eachSegment.segment_name}>
              {eachSegment?.fees.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {headers.map(each => (
                            <TableCell style={each.width ? { width: each.width } : {}}>{each.label}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eachSegment.fees.map((eachFeesDetail, index) => (
                          <TableRow>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{eachFeesDetail.fees_type}</TableCell>
                            <TableCell>
                              {feesDetail.program_fees_id == eachFeesDetail.program_fees_id ? (
                                <Input type='number' onChange={handleFeesChange} value={feesDetail.fees} />
                              ) : (
                                eachFeesDetail.fees
                              )}
                            </TableCell>
                            <TableCell>
                              {feesDetail.program_fees_id == eachFeesDetail.program_fees_id ? (
                                <Box display='flex' alignItems='center' justifyContent='center'>
                                  <Button onClick={() => handleEditFees()}>
                                    <Check color='success' />
                                  </Button>
                                  <Button onClick={() => handleCancelEdit()}>
                                    <Close color='error' />
                                  </Button>
                                </Box>
                              ) : (
                                <DropDownMenu dropDownMenuOptions={getKebabOptions(eachFeesDetail)} />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button onClick={onCreateProgramFeeClick}>Add Fees Type</Button>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button onClick={onCreateProgramFeeClick}>Add Fees Details</Button>
                </Box>
              )}
            </ChaarvyAccordian>
          ))}
          {showAddProgramFeesButton() && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button onClick={onCreateProgramFeeClick}>Add Fees Details</Button>
            </Box>
          )}
        </>
      </ChaarvyModal>
      {createProgramFeesModal()}
    </>
  )
}

export default ProgramFeesModal

// TODO: Need to remove add program fees button when fees types are matched with available fees types in fees response list
