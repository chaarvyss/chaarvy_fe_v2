import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, styled, TabProps } from '@mui/material'
import { BookOutline, Cash, GoogleMaps } from 'mdi-material-ui'
import { usePathname, useRouter } from 'next/navigation'
import { SyntheticEvent, useEffect, useState } from 'react'

import { AccountOutline } from '@mdiElements'
import { Card, MuiTab } from '@muiElements'
import { TabName } from 'src/reusable_components/styledComponents/TabName'
import { useGetTabsStatusQuery } from 'src/store/services/admisissionsService'

import AddonCourseDetails from './addonCourseDetails'
import StudentAddress from './address'
import FeesDetails from './FeesDetails'
import StudentBaseDetails from './studentBaseDetails'
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
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState<AdmissionFormType>(AdmissionFormType.BASE_DETAIL)
  const handleChange = (_: SyntheticEvent, newValue: AdmissionFormType) => setValue(newValue)
  const [application_id, setApplication] = useState<string>()

  const [shouldDisableTabs, setShouldDisableTabs] = useState<boolean>(true)
  const handleAdmissionCreation = (admission_id: string) => {
    setApplication(admission_id)
  }

  const { data: tabStatus, refetch: refetch_tabStatus } = useGetTabsStatusQuery(application_id ?? '', {
    skip: !application_id
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      setApplication(queryParams.get('id') ?? undefined)

      if (queryParams.get('step') == '2') {
        setShouldDisableTabs(false)
        handleNext(AdmissionFormType.STUDENT_DETAIL)
        router.replace(pathname)
      }
    }
  }, [])

  const handleNext = (step: AdmissionFormType) => {
    if (step === AdmissionFormType.ADDON_COURSE) {
      refetch_tabStatus()
    }
    setValue(step)
  }

  const getTabColor = (condition?: number) => {
    const glassShine = 'linear-gradient(to bottom, #ffffffcc 0%, #ffffff00 95%)'

    if (!tabStatus) return ''

    switch (condition) {
      case 0:
        return `${glassShine}, linear-gradient(to top, #faf3e8, #ffc400)`

      case 1:
        return `${glassShine}, linear-gradient(to top, #f1fff1, #04f808)`

      default:
        return `${glassShine}, linear-gradient(to top, #b3e5fc, #81d4fa)`
    }
  }

  const tabs = [
    {
      value: AdmissionFormType.BASE_DETAIL,
      label: 'Student Base Details',
      icon: <AccountOutline />,
      tabBackgroudColor: getTabColor(tabStatus?.student_base_details),
      component: (
        <StudentBaseDetails
          student_id={application_id}
          onAdmissionCreation={handleAdmissionCreation}
          handleNext={handleNext}
          handleTabDisable={setShouldDisableTabs}
        />
      )
    },
    {
      value: AdmissionFormType.STUDENT_DETAIL,
      label: 'Student Details',
      tabBackgroudColor: getTabColor(tabStatus?.student_details),
      icon: <AccountOutline />,
      component: <StudentDetails student_id={application_id} handleNext={handleNext} />
    },
    {
      value: AdmissionFormType.ADDRESS,
      label: 'Student Address',
      tabBackgroudColor: getTabColor(tabStatus?.address),
      icon: <GoogleMaps />,
      component: <StudentAddress student_id={application_id} handleNext={handleNext} />
    },
    {
      value: AdmissionFormType.ADDON_COURSE,
      label: 'ADDON Courses',
      tabBackgroudColor: getTabColor(tabStatus?.addon_course),
      icon: <BookOutline />,
      component: <AddonCourseDetails student_id={application_id} />
    },

    {
      value: AdmissionFormType.FEES,
      label: 'Fees Details',
      tabBackgroudColor: getTabColor(tabStatus?.fees),
      icon: <Cash />,
      component: <FeesDetails student_id={application_id} />
    }
  ]

  const shouldDisableTab = ({ value }: { value: AdmissionFormType }): boolean => {
    if (shouldDisableTabs) return value !== AdmissionFormType.BASE_DETAIL

    return false
  }

  return (
    <Card>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='admission-form tabs'
          sx={{ borderBottom: t => `1px solid ${t.palette.divider}`, display: 'flex' }}
        >
          {tabs.map(({ value, label, icon, tabBackgroudColor }) => (
            <Tab
              disabled={shouldDisableTab({ value })}
              key={value}
              value={value}
              sx={{ backgroundImage: tabBackgroudColor }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {icon}
                  <TabName sx={{ textTransform: 'none' }}>{label}</TabName>
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
