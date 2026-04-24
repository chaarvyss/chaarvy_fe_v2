import { Card } from '@muiElements'
import AddressForm, { AddressType } from 'src/common/addressForm'
import { useGetStudentAddressQuery } from 'src/store/services/admisissionsService'

import { AdmissionFormType } from '.'

const StudentAddress = ({
  application_id,
  handleNext
}: {
  application_id?: string
  handleNext: (step: AdmissionFormType) => void
}) => {
  const { data: address, isFetching: isFetchingAddress } = useGetStudentAddressQuery(application_id ?? '', {
    skip: !application_id
  })

  return (
    <Card sx={{ p: 3 }}>
      <AddressForm
        application_id={application_id}
        address_id={address?.address_id}
        user_type={AddressType.STUDENT}
        isLoading={isFetchingAddress}
        handleNext={() => handleNext(AdmissionFormType.FEES)}
      />
    </Card>
  )
}

export default StudentAddress
