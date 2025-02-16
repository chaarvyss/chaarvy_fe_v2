import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, Typography } from '@muiElements'
import React, { useEffect, useState } from 'react'
import { TableHeaders } from 'src/lib/interfaces'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { Program } from 'src/lib/types'
import CreateOrUpdateProgramModal from './createUpdateProgram'
import ProgramBooksModal from './program_books_modal'
import ProgramFeesModal from './program_fees_modal'
import { useLazyGetProgramsListQuery } from 'src/store/services/listServices'
import Tag from 'src/reusable_components/tag'
import { useUpdateProgramStatusMutation } from 'src/store/services/adminServices'
import { useToast, ToastVariants } from 'src/@core/context/toastContext'
import ProgramViewModal from './program_view_modal'

import { useLazyGetProgramSegmentDetailsQuery } from 'src/store/services/viewServices'

const headers: TableHeaders[] = [
  { label: 's#' },
  { label: 'Program Name' },
  { label: 'Status' },
  { label: 'Actions', width: '100px' }
]

interface ProgramModals {
  create_program_modal: boolean
  fees_details_list_modal: boolean
  books_details_list_modal: boolean
  view_program_details_modal: boolean
}

const Programs = () => {
  const [showModal, setShowModal] = useState<ProgramModals>({
    create_program_modal: false,
    fees_details_list_modal: false,
    books_details_list_modal: false,
    view_program_details_modal: false
  })

  const { triggerToast } = useToast()

  const [fetchProgramsList, { data: programsListData }] = useLazyGetProgramsListQuery()
  const [updateProgramStatus] = useUpdateProgramStatusMutation()

  const [fetchProgramSegment] = useLazyGetProgramSegmentDetailsQuery()

  const [selectedProgram, setSelectedProgram] = useState<Program>()
  const handleCreateProgram = () => {
    setShowModal({ ...showModal, create_program_modal: true })
  }

  useEffect(() => {
    fetchProgramsList(false)
  }, [])

  const handleProgramModalClose = () => {
    setSelectedProgram(undefined)
    setShowModal({ ...showModal, create_program_modal: false })
  }

  const handleBooksModalClose = () => {
    setSelectedProgram(undefined)
    setShowModal({ ...showModal, books_details_list_modal: false })
  }

  const handleFeesModalClose = () => {
    setSelectedProgram(undefined)
    setShowModal({ ...showModal, fees_details_list_modal: false })
  }

  const handleProgramViewModalClose = () => {
    setSelectedProgram(undefined)
    setShowModal({ ...showModal, view_program_details_modal: false })
  }

  const handleKebabOptionClick = (program: Program, option: 'Edit' | 'view' | 'books' | 'fees') => {
    setSelectedProgram(program)
    switch (option) {
      case 'Edit':
        handleCreateProgram()
        break
      case 'view':
        fetchProgramSegment(program.program_id)
        setShowModal({ ...showModal, view_program_details_modal: true })
        break
      case 'fees':
        /*
        fees details
        year / semester
        s# | fee Particulars | fees | action
        */
        setShowModal({ ...showModal, fees_details_list_modal: true })
        break
      case 'books':
        /*
          books details
          year / semester
            s# | book name | price | current_stock
          */
        setShowModal({ ...showModal, books_details_list_modal: true })
        break
    }
  }

  const getKebabOptions = (eachProgram: Program) => {
    // TODO: edit program, books, fees
    return [
      {
        id: eachProgram.program_id,
        label: 'View',
        onOptionClick: () => handleKebabOptionClick(eachProgram, 'view')
      },
      {
        id: eachProgram.program_id,
        label: 'Edit',
        onOptionClick: () => handleKebabOptionClick(eachProgram, 'Edit')
      },
      {
        id: eachProgram.program_id,
        label: 'Books Details',
        onOptionClick: () => handleKebabOptionClick(eachProgram, 'books')
      },
      {
        id: eachProgram.program_id,
        label: 'Fees details',
        onOptionClick: () => handleKebabOptionClick(eachProgram, 'fees')
      }
    ]
  }

  const handleUpdateStatus = (id: string) => {
    updateProgramStatus(id)
      .unwrap()
      .then(e => triggerToast(e, { variant: ToastVariants.SUCCESS }))
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  return (
    <>
      <TableTilteHeader title='Programs' buttonTitle='Create Program' onButtonClick={handleCreateProgram} />
      <Card>
        {(programsListData ?? []).length > 0 ? (
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
                {(programsListData ?? []).map((eachProgram: Program, index) => (
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{eachProgram?.program_name}</TableCell>
                    <TableCell>
                      <Tag status={eachProgram?.status} onClick={() => handleUpdateStatus(eachProgram.program_id)} />
                    </TableCell>
                    <TableCell>
                      <DropDownMenu dropDownMenuOptions={getKebabOptions(eachProgram)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>No Programs Available</Typography>
          </Box>
        )}
      </Card>
      <CreateOrUpdateProgramModal
        selectedProgram={selectedProgram}
        isOpen={showModal.create_program_modal}
        onClose={handleProgramModalClose}
      />
      <ProgramBooksModal
        selectedProgram={selectedProgram}
        isOpen={showModal.books_details_list_modal}
        onClose={handleBooksModalClose}
      />
      {showModal.fees_details_list_modal && (
        <ProgramFeesModal
          selectedProgram={selectedProgram}
          isOpen={showModal.fees_details_list_modal}
          onClose={handleFeesModalClose}
        />
      )}
      {showModal.view_program_details_modal && (
        <ProgramViewModal
          isOpen={showModal.view_program_details_modal}
          onClose={handleProgramViewModalClose}
          selectedProgram={selectedProgram}
        />
      )}
    </>
  )
}

export default Programs

/*  TODO:
programs:
  ** Need to update all features with permission management
  Need to integrate apis
  Need to add validation and error messages while creating and updating Program information.
  need to add an option for adding segments ie, year, semester ...
  need to show program details which contain the info of 
    -eligibility criteria
    -program duriation
    -segments available

fees details:
  ** Need to update all features with permission management
  Need to integrate apis
  need to create modal design for displaying fees details.
  Need to add validation and error messages while creating and updating Program Fee details.
  
books details:
  ** Need to update all features with permission management
  need to integrate apis
  need to add remove book functionality with warning message
*/
