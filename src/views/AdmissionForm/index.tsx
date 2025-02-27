import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, styled, TabProps } from '@mui/material'
import React, { SyntheticEvent, useState } from 'react'

import { AccountOutline } from '@mdiElements'
import { Card, MuiTab } from '@muiElements'

import StudentBaseDetails from './studentBaseDetails'
import StudentAddress from './address'
import { BookOutline, Cash, Cash100, GoogleMaps } from 'mdi-material-ui'
import AddonCourseDetails from './addonCourseDetails'
import FeesDetails from './feesDetails'

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}))

const AdmissionForm = () => {
  enum FormType {
    BASE_DETAIL = 'base_details',
    ADDON_COURSE = 'add_on_course',
    ADDRESS = 'address',
    FEES = 'fees'
  }

  const [value, setValue] = useState<FormType>(FormType.BASE_DETAIL)
  const handleChange = (_: SyntheticEvent, newValue: FormType) => setValue(newValue)

  const tabs = [
    {
      value: FormType.BASE_DETAIL,
      label: 'Student Details',
      icon: <AccountOutline />,
      component: <StudentBaseDetails />
    },
    { value: FormType.ADDON_COURSE, label: 'ADDON Courses', icon: <BookOutline />, component: <AddonCourseDetails /> },
    { value: FormType.ADDRESS, label: 'Student Address', icon: <GoogleMaps />, component: <StudentAddress /> },
    { value: FormType.FEES, label: 'Fees Details', icon: <Cash />, component: <FeesDetails /> }
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
