import { Card } from '@muiElements'
import AddressForm, { AddressType } from 'src/common/addressForm'
import { useGetStudentAddressQuery } from 'src/store/services/admisissionsService'

import { AdmissionFormType } from '.'

const StudentAddress = ({
  student_id,
  handleNext
}: {
  student_id?: string
  handleNext: (step: AdmissionFormType) => void
}) => {
  const { data: address, isFetching: isFetchingAddress } = useGetStudentAddressQuery(student_id ?? '', {
    skip: !student_id
  })

  return (
    <Card sx={{ p: 3 }}>
      <AddressForm
        student_id={student_id}
        address_id={address?.address_id}
        user_type={AddressType.STUDENT}
        isLoading={isFetchingAddress}
        handleNext={() => handleNext(AdmissionFormType.ADDON_COURSE)}
      />
    </Card>
  )
}

export default StudentAddress
