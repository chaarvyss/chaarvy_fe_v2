import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, styled, TabProps } from '@mui/material'
import React, { SyntheticEvent, useEffect, useState } from 'react'

import { AccountOutline } from '@mdiElements'
import { Card, MuiTab } from '@muiElements'

import StudentBaseDetails from './studentBaseDetails'
import StudentAddress from './address'
import { BookOutline, Cash, GoogleMaps } from 'mdi-material-ui'
import AddonCourseDetails from './addonCourseDetails'
import FeesDetails from './feesDetails'
import { useLazyGetAdmissionDetailQuery } from 'src/store/services/admisissionsService'
import { TabName } from 'src/reusable_components/styledComponents/TabName'
import StudentDetails from './studentDetails'

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

export enum AdmissionFormType {
  BASE_DETAIL = 'base_details',
  STUDENT_DETAIL = 'student_details',
  ADDON_COURSE = 'add_on_course',
  ADDRESS = 'address',
  FEES = 'fees'
}

const AdmissionForm = () => {
  const [value, setValue] = useState<AdmissionFormType>(AdmissionFormType.BASE_DETAIL)
  const handleChange = (_: SyntheticEvent, newValue: AdmissionFormType) => setValue(newValue)
  const [application_id, setApplication] = useState<string | undefined>()

  const [fetchStudentDetails, { data: studentDetail }] = useLazyGetAdmissionDetailQuery()

  const handleAdmissionCreation = (admission_id: string) => {
    setApplication(admission_id)
    fetchStudentDetails(admission_id)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      setApplication(queryParams.get('id') ?? undefined)

      if (queryParams.get('step') == '2') {
        handleNext(AdmissionFormType.ADDON_COURSE)
      }
    }
  }, [])

  const handleNext = (step: AdmissionFormType) => {
    setValue(step)
  }

  useEffect(() => {
    if (application_id) fetchStudentDetails(application_id)
  }, [application_id])

  const tabs = [
    {
      value: AdmissionFormType.BASE_DETAIL,
      label: 'Student Base Details',
      icon: <AccountOutline />,
      component: (
        <StudentBaseDetails
          application_id={application_id}
          onAdmissionCreation={handleAdmissionCreation}
          handleNext={handleNext}
        />
      )
    },
    {
      value: AdmissionFormType.STUDENT_DETAIL,
      label: 'Student Details',
      icon: <AccountOutline />,
      component: (
        <StudentDetails
          application_id={application_id}
          onAdmissionCreation={handleAdmissionCreation}
          handleNext={handleNext}
        />
      )
    },
    {
      value: AdmissionFormType.ADDON_COURSE,
      label: 'ADDON Courses',
      icon: <BookOutline />,
      component: (
        <AddonCourseDetails
          application_id={application_id}
          programId={studentDetail?.program_id}
          handleNext={handleNext}
        />
      )
    },
    {
      value: AdmissionFormType.ADDRESS,
      label: 'Student Address',
      icon: <GoogleMaps />,
      component: <StudentAddress application_id={application_id} handleNext={handleNext} />
    },
    {
      value: AdmissionFormType.FEES,
      label: 'Fees Details',
      icon: <Cash />,
      component: <FeesDetails application_id={application_id} segment_id={studentDetail?.segment} />
    }
  ]

  return (
    <Card>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='admission-form tabs'
          sx={{ borderBottom: t => `1px solid ${t.palette.divider}` }}
        >
          {tabs.map(({ value, label, icon }) => (
            <Tab
              disabled={value !== AdmissionFormType.BASE_DETAIL && !application_id}
              key={value}
              value={value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {icon}
                  <TabName>{label}</TabName>
                </Box>
              }
            />
          ))}
        </TabList>
        {tabs.map(({ value, component }) => (
          <TabPanel key={value} sx={{ p: 0 }} value={value}>
            {component}
          </TabPanel>
        ))}
      </TabContext>
    </Card>
  )
}

export default AdmissionForm
