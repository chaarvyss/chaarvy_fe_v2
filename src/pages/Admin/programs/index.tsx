import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@muiElements'
import React, { useEffect, useState } from 'react'
import { TableHeaders } from 'src/lib/interfaces'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { Program } from 'src/lib/types'
import { Card, Typography } from '@mui/material'
import CreateOrUpdateProgramModal from './createUpdateProgram'
import ProgramBooksModal from './program_books_modal'
import ProgramFeesModal from './program_fees_modal'
import { useLazyGetProgramsListQuery } from 'src/store/services/listServices'

const programs: Program[] = [
  {
    program_id: 'asdfas',
    program_name: 'msc',
    status: 1
  }
]

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
}

const Programs = () => {
  const [showModal, setShowModal] = useState<ProgramModals>({
    create_program_modal: false,
    fees_details_list_modal: false,
    books_details_list_modal: false
  })

  const [fetchProgramsList, { data: programsListData }] = useLazyGetProgramsListQuery()

  console.log(programsListData)
  const [selectedProgram, setSelectedProgram] = useState<Program>() // for using program_id to update

  const handleCreateProgram = () => {
    setShowModal({ ...showModal, create_program_modal: true })
  }

  useEffect(() => {
    setSelectedProgram(undefined)
    fetchProgramsList({ active_only: true })
  }, [showModal])

  const handleProgramModalClose = () => {
    setShowModal({ ...showModal, create_program_modal: false })
  }

  const handleBooksModalClose = () => {
    setShowModal({ ...showModal, books_details_list_modal: false })
  }

  const handleFeesModalClose = () => {
    setShowModal({ ...showModal, fees_details_list_modal: false })
  }

  const handleKebabOptionClick = (program: Program, option: 'Edit' | 'view' | 'books' | 'fees') => {
    setSelectedProgram(program)
    switch (option) {
      case 'Edit':
        handleCreateProgram()
        break
      case 'view':
        // TODO: need to show program name, program description if any
        alert(`${program.program_id}View clicked`)
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

  return (
    <>
      <TableTilteHeader title='Programs' buttonTitle='Create Program' onButtonClick={handleCreateProgram} />
      <Card>
        {programs.length > 0 ? (
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
                {programs.map((eachProgram, index) => (
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{eachProgram.program_name}</TableCell>
                    <TableCell>{eachProgram.status}</TableCell>
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
        <ProgramFeesModal
          selectedProgram={selectedProgram}
          isOpen={showModal.fees_details_list_modal}
          onClose={handleFeesModalClose}
        />
      </Card>
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
