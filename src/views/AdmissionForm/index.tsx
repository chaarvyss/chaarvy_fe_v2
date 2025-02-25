import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, styled, TabProps } from '@mui/material'
import React, { SyntheticEvent, useState } from 'react'

import { AccountOutline } from '@mdiElements'
import { Card, MuiTab } from '@muiElements'

import StudentBaseDetails from './studentBaseDetails'
import StudentAddress from './address'
import { GoogleMaps } from 'mdi-material-ui'

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
  /*
  Using stepper
    form 1 -> base details and student photo
    form 2 -> student address
  */

  type FORMS = 'base_details' | 'address' | 'fees' | 'payment'

  enum FormType {
    BASE_DETAIL = 'base_details',
    ADDRESS = 'address',
    FEES = 'fees',
    PAYMENT = 'payment'
  }
  const [value, setValue] = useState<FORMS>(FormType.BASE_DETAIL)

  const handleChange = (event: SyntheticEvent, newValue: FORMS) => {
    setValue(newValue)
  }

  return (
    <Card>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='account-settings tabs'
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            value={FormType.BASE_DETAIL}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountOutline />
                <TabName>Student Details</TabName>
              </Box>
            }
          />
          <Tab
            value={FormType.ADDRESS}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GoogleMaps />
                <TabName>Student Address</TabName>
              </Box>
            }
          />
        </TabList>

        <TabPanel sx={{ p: 0 }} value={FormType.BASE_DETAIL}>
          <StudentBaseDetails />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value={FormType.ADDRESS}>
          <StudentAddress />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default AdmissionForm
