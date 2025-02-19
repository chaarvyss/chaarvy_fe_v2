import React from 'react'

import ChaarvyModal from 'src/reusable_components/chaarvyModal'

import Users from '../../pages/Admin/users'

const AddProgram = () => {
  return (
    <ChaarvyModal isOpen={true} onClose={() => alert('closing')} title='Add Program'>
      <Users />
    </ChaarvyModal>
  )
}

export default AddProgram
