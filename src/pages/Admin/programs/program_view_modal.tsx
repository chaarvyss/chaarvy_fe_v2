import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { TableHeaders } from 'src/lib/interfaces'
import { Program } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useCreateProgramSegmentMutation } from 'src/store/services/adminServices'
import { useGetSegmentsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramSecondLanguagesListQuery } from 'src/store/services/programServices'
import { useLazyGetProgramSegmentDetailsQuery } from 'src/store/services/viewServices'
import ProgramSecondLanguage from './program_second_language'
import ProgramMediums from './program_mediums'

interface ProgramView {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

const ProgramViewModal = ({ selectedProgram, isOpen, onClose }: ProgramView) => {
  const { triggerToast } = useToast()
  const { data: segments } = useGetSegmentsListQuery()
  const [fetchProgramSegment, { data: programSegmentDetails }] = useLazyGetProgramSegmentDetailsQuery()
  const [createProgramSegment] = useCreateProgramSegmentMutation()
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [selectedSegment, setSelectedSegment] = useState<string>()

  useEffect(() => {
    fetchProgramSegment(selectedProgram?.program_id ?? '')
  }, [selectedProgram])

  const headers: TableHeaders[] = [{ label: 's#' }, { label: 'Segment Name' }]

  const handleAddModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedSegment(undefined)
  }

  const handleSubmit = () => {
    createProgramSegment({
      program_id: selectedProgram?.program_id ?? '',
      segment_id: selectedSegment ?? ''
    })
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        handleAddModalClose()
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  const addProgramSegmentModal = () => {
    return (
      <ChaarvyModal
        shouldRestrictCloseOnOuterClick
        isOpen={isEditModalOpen}
        onClose={handleAddModalClose}
        title={selectedProgram?.program_name}
      >
        <>
          <FormControl fullWidth>
            <InputLabel id='program-segment'>Select Program Segment</InputLabel>
            <Select
              label='Select Program Segment'
              value={selectedSegment}
              onChange={e => setSelectedSegment(e?.target?.value as string)}
            >
              {(segments ?? []).map(each => (
                <MenuItem value={each.segment_id}>{each.segment_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display='flex' justifyContent='space-around' marginTop='1rem'>
            <Button onClick={handleAddModalClose} variant='outlined' color='error'>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedSegment} variant='contained'>
              Add
            </Button>
          </Box>
        </>
      </ChaarvyModal>
    )
  }

  const showAddSegmentButton = (): boolean => {
    return (
      !!programSegmentDetails &&
      !!segments &&
      (programSegmentDetails.length == 0 || programSegmentDetails.length !== segments.length)
    )
  }

  return (
    <>
      <ChaarvyModal isOpen={isOpen} onClose={onClose} title={selectedProgram?.program_name} modalSize='col-12 col-md-6'>
        <>
          {programSegmentDetails && programSegmentDetails?.length > 0 ? (
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
                  {(programSegmentDetails ?? []).map((eachProgramSegment, index) => (
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{eachProgramSegment.segment_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography>No Segments Available for this program</Typography>
              </Box>
            </>
          )}
          {showAddSegmentButton() && <Button onClick={() => setIsEditModalOpen(true)}>Add program segment</Button>}

          <Box gap='24px'>
            <ProgramSecondLanguage program_id={selectedProgram?.program_id as string} />
            <ProgramMediums program_id={selectedProgram?.program_id as string} />
          </Box>
        </>
      </ChaarvyModal>
      {addProgramSegmentModal()}
    </>
  )
}

export default ProgramViewModal
