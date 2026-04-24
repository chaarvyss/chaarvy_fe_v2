'use client'

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
  Typography,
  TextField
} from '@mui/material'
import React, { useEffect, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { TableHeaders } from 'src/lib/interfaces'
import { Program } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useCreateProgramSegmentMutation, useCreateUpdateSegmentMutation } from 'src/store/services/adminServices'
import { useGetSegmentsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramSegmentDetailsQuery } from 'src/store/services/viewServices'

// ✅ NEW API (you must implement this in your service)

import ProgramMediums from './program_mediums'
import ProgramSecondLanguage from './program_second_language'
import ProgramSection from './program_sections'

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
  const [createSegment] = useCreateUpdateSegmentMutation() // ✅ new API

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateSegmentModalOpen, setIsCreateSegmentModalOpen] = useState(false)

  const [selectedSegment, setSelectedSegment] = useState<string>()
  const [newSegmentName, setNewSegmentName] = useState('')

  useEffect(() => {
    fetchProgramSegment(selectedProgram?.program_id ?? '')
  }, [selectedProgram])

  const headers: TableHeaders[] = [{ label: 's#' }, { label: 'Segment Name' }]

  const handleAddModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedSegment(undefined)
  }

  // ✅ Assign segment to program
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

  const handleCreateSegment = () => {
    createSegment(newSegmentName)
      .unwrap()
      .then((res: any) => {
        triggerToast(res, { variant: ToastVariants.SUCCESS })

        setIsCreateSegmentModalOpen(false)
        setNewSegmentName('')

        // auto select new segment
        setSelectedSegment(res.segment_id)

        // reopen assign modal
        setIsEditModalOpen(true)
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  const handleSegmentChange = (event: any) => {
    setSelectedSegment(event.target.value)
  }

  const showAddSegmentButton = (): boolean => {
    return (
      !!programSegmentDetails &&
      !!segments &&
      (programSegmentDetails.length === 0 || programSegmentDetails.length !== segments.length)
    )
  }

  // ✅ Assign Segment Modal
  const addProgramSegmentModal = () => (
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
            labelId='program-segment'
            label='Select Program Segment'
            value={selectedSegment || ''}
            onChange={handleSegmentChange}
          >
            {(segments ?? []).map(each => (
              <MenuItem key={each.segment_id} value={each.segment_id}>
                {each.segment_name}
              </MenuItem>
            ))}

            {/* ✅ Create new option */}
            <MenuItem
              value='create_new'
              onClick={() => {
                setIsEditModalOpen(false)
                setIsCreateSegmentModalOpen(true)
              }}
            >
              + Create New Segment
            </MenuItem>
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

  // ✅ Create Segment Modal
  const createSegmentModal = () => (
    <ChaarvyModal
      isOpen={isCreateSegmentModalOpen}
      onClose={() => setIsCreateSegmentModalOpen(false)}
      title='Create New Segment'
    >
      <>
        <TextField
          fullWidth
          label='Segment Name'
          value={newSegmentName}
          onChange={e => setNewSegmentName(e.target.value)}
        />

        <Box display='flex' justifyContent='space-around' mt={2}>
          <Button onClick={() => setIsCreateSegmentModalOpen(false)} color='error'>
            Cancel
          </Button>

          <Button variant='contained' disabled={!newSegmentName} onClick={handleCreateSegment}>
            Create
          </Button>
        </Box>
      </>
    </ChaarvyModal>
  )

  return (
    <>
      <ChaarvyModal isOpen={isOpen} onClose={onClose} title={selectedProgram?.program_name} modalSize='col-12 col-md-6'>
        <>
          {programSegmentDetails && programSegmentDetails.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {headers.map((each, idx) => (
                      <TableCell key={`${each.label}-${idx}`} style={each.width ? { width: each.width } : {}}>
                        {each.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {programSegmentDetails.map((eachProgramSegment, index) => (
                    <TableRow key={eachProgramSegment.program_segment_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{eachProgramSegment.segment_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography>No Segments Available for this program</Typography>
            </Box>
          )}

          {showAddSegmentButton() && <Button onClick={() => setIsEditModalOpen(true)}>Add program segment</Button>}

          <Box gap='24px'>
            <ProgramSection program_id={selectedProgram?.program_id as string} />
            <ProgramMediums program_id={selectedProgram?.program_id as string} />
            <ProgramSecondLanguage program_id={selectedProgram?.program_id as string} />
          </Box>
        </>
      </ChaarvyModal>

      {addProgramSegmentModal()}
      {createSegmentModal()}
    </>
  )
}

export default ProgramViewModal
