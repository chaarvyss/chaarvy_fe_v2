import React, { SyntheticEvent, useState } from 'react'
import StudentBaseDetails from './studentBaseDetails'
import { Card, MuiTab } from '@muiElements'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, styled, TabProps } from '@mui/material'
import { AccountOutline } from '@mdiElements'

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
  */
  const [value, setValue] = useState<string>('account')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
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
            value='account'
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountOutline />
                <TabName>Student Details</TabName>
              </Box>
            }
          />
        </TabList>

        <TabPanel sx={{ p: 0 }} value='account'>
          <StudentBaseDetails />
        </TabPanel>
      </TabContext>
    </Card>
  )
}

export default AdmissionForm
