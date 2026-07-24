import { TabContext, TabList, TabPanel } from '@mui/lab'
import {
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
  Typography
} from '@mui/material'
import React, { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'

import { Box, Grid, TextField } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import AddressForm, { AddressType } from 'src/common/addressForm'
import { InputVariants } from 'src/lib/enums'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { TabName } from 'src/reusable_components/styledComponents/TabName'
import StyledImage from 'src/reusable_components/styledImage'
import { useCreateUpdateUserMutation } from 'src/store/services/adminServices'
import { useUploadProfilePicMutation } from 'src/store/services/authServices'
import { useGetRolesListQuery } from 'src/store/services/listServices'
import { useGetUserProfileQuery, UserProfile } from 'src/store/services/viewServices'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import FacultyAssignmentPage from './subjectAssignment'
import UserPermissions from './userPermissions'

enum FormType {
  BASE_DETAIL = 'base_detail',
  ADDRESS = 'address',
  PERMISSIONS = 'permissions',
  FACULTY_ASSIGNMENT = 'faculty_assignment'
}

const baseProfileKeys = [
  { v: 'name', l: 'Name' },
  { v: 'username', l: 'Username' },
  { v: 'mobile', l: 'Mobile' },
  { v: 'email', l: 'Email' }
]

const mainKeys = [
  { v: 'name', l: 'Name' },
  { v: 'username', l: 'Username' },
  { v: 'mobile', l: 'Mobile' },
  { v: 'email', l: 'Email' },
  { v: 'role_name', l: 'Role' },
  { v: 'created_date', l: 'Joining Date' }
]

interface UserProfileProps {
  user_id: string
  onClose: () => void
}

const ViewUserProfile = (props: UserProfileProps) => {
  const { user_id, onClose } = props
  const { data: details } = useGetUserProfileQuery(user_id)
  const [newDetails, setNewDetails] = useState<UserProfile>()
  const [value, setValue] = useState<FormType>(FormType.BASE_DETAIL)
  const [profilePic, setProfilePic] = useState<File>()
  const [profilePicUrl, setProfilePicUrl] = useState<string>()

  const [updateUserProfile] = useCreateUpdateUserMutation()

  const { data: rolesData, isLoading: isRolesListLoading } = useGetRolesListQuery()

  const [uploadProfilePic] = useUploadProfilePicMutation()

  const { triggerToast } = useToast()

  useEffect(() => {
    if (details) {
      setNewDetails(details)
      setProfilePicUrl(details.profile_pic ?? undefined)
    }
  }, [details])

  const handleChange =
    (prop: keyof UserProfile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) =>
      setNewDetails(prev => ({ ...prev, [prop]: event?.target?.value ?? event }))

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePic(file)
      setProfilePicUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadProfilePic = () => {
    if (profilePic) {
      uploadProfilePic({ photo: profilePic, user_id })
        .unwrap()
        .then(res => {
          setProfilePic(undefined)
          triggerToast(res, { variants: ToastVariants.SUCCESS })
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  const handleSubmit = () => {
    if (newDetails) {
      updateUserProfile({ user: newDetails, user_id })
        .unwrap()
        .then(res => {
          triggerToast(res, { variant: ToastVariants.SUCCESS })
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  const BaseDetailsTab = () => (
    <Grid container spacing={7}>
      {baseProfileKeys.map(field => (
        <Grid item xs={12} md={6} key={field.v}>
          <Box display='flex' flexDirection='column'>
            <small>{field.l.replace('_', ' ')}</small>
            <TextField
              onChange={handleChange(field.v as keyof UserProfile)}
              value={newDetails?.[field.v as keyof UserProfile]}
              disabled={field.v == 'created_on'}
              type={field.v === 'mobile' ? InputVariants.NUMBER : 'text'}
              size='small'
            />
          </Box>
        </Grid>
      ))}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <small>Role</small>
          <Select value={newDetails?.Role ?? ''} onChange={handleChange('Role')} size='small'>
            {isRolesListLoading ? (
              <MenuItem disabled>
                <CircularProgress size={24} />
              </MenuItem>
            ) : (
              (rolesData ?? []).map(({ role_id, role_name }) => (
                <MenuItem key={role_id} value={role_id}>
                  {role_name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Grid>
      {newDetails !== details && (
        <Grid item>
          <Button onClick={handleSubmit}>Update Profile</Button>
        </Grid>
      )}
    </Grid>
  )

  const handleTabChange = (_: SyntheticEvent, newValue: FormType) => setValue(newValue)

  const tabs = [
    {
      value: FormType.BASE_DETAIL,
      label: 'User Details',
      icon: <GetChaarvyIcons iconName={ChaarvyIcon.AccountDetails} fontSize='1.25rem' />,
      component: BaseDetailsTab()
    },
    {
      value: FormType.ADDRESS,
      label: 'Address',
      icon: <GetChaarvyIcons iconName={ChaarvyIcon.MapMarkerOutline} fontSize='1.25rem' />,
      component: <AddressForm user_type={AddressType.USER} user_id={user_id} address_id={details?.address_id} />
    },

    {
      value: FormType.PERMISSIONS,
      label: 'Permissions',
      icon: <GetChaarvyIcons iconName={ChaarvyIcon.AccountLockOutline} fontSize='1.25rem' />,
      component: <UserPermissions user_id={user_id} />
    },
    {
      value: FormType.FACULTY_ASSIGNMENT,
      label: 'Faculty Assignment',
      icon: <GetChaarvyIcons iconName={ChaarvyIcon.AccountGroupOutline} fontSize='1.25rem' />,
      component: (
        <FacultyAssignmentPage
          facultyId={user_id}
          isOpen={value === FormType.FACULTY_ASSIGNMENT}
          onClose={() => setValue(FormType.BASE_DETAIL)}
        />
      )
    }
  ]

  return (
    <ChaarvyModal modalSize='col-12 col-md-10' title='User Profile' isOpen={true} onClose={onClose}>
      <Box
        className='d-flex flex-column flex-md-row justify-content-center align-items-start'
        gap={4}
        overflow='hidden'
        minHeight='70vh'
      >
        <Box
          className='border col-12 col-md-4 d-flex flex-column justify-content-center align-items-center rounded'
          gap={4}
          padding={4}
        >
          <Box className='position-relative'>
            <StyledImage variant='rounded' src={profilePicUrl ?? '/images/avatars/1.png'} alt='add photo' />
            <IconButton
              component='label'
              color='info'
              htmlFor='upload-image'
              className='position-absolute bg-info'
              sx={{ bottom: '0px', right: '20px' }}
            >
              <GetChaarvyIcons iconName={ChaarvyIcon.PencilOutline} color='white' />
              <input hidden type='file' onChange={handleImageUpload} accept='image/png, image/jpeg' id='upload-image' />
            </IconButton>
            {profilePic && (
              <IconButton
                sx={{ bottom: '0px', right: '-30px' }}
                className='position-absolute bg-success'
                onClick={handleUploadProfilePic}
              >
                <GetChaarvyIcons iconName={ChaarvyIcon.ContentSave} color='white' />
              </IconButton>
            )}
          </Box>
          <Grid container spacing={1.5} sx={{ maxWidth: 400, mx: 'auto', width: '100%', mt: 2 }}>
            {mainKeys.map(field => (
              <React.Fragment key={field.l}>
                <Grid item xs={5}>
                  <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'left' }}>
                    {field.l}
                  </Typography>
                </Grid>

                <Grid item xs={7}>
                  <Typography variant='body2' fontWeight={500} sx={{ textAlign: 'left', wordBreak: 'break-word' }}>
                    {details?.[field.v as keyof UserProfile] ?? '-'}
                  </Typography>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Box>
        <TabContext value={value}>
          <Box>
            <Box sx={{ overflow: 'auto' }}>
              <TabList
                onChange={handleTabChange}
                aria-label='admission-form tabs'
                sx={{ borderBottom: t => `1px solid ${t.palette.divider}` }}
              >
                {tabs.map(({ value, label, icon }) => (
                  <Tab
                    key={value}
                    sx={{ textTransform: 'none' }}
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
            </Box>
            <Box margin='1rem 0rem' maxHeight='60vh' overflow='auto'>
              {tabs.map(({ value, component }) => (
                <TabPanel key={value} sx={{ p: 0 }} value={value}>
                  {component}
                </TabPanel>
              ))}
            </Box>
          </Box>
        </TabContext>
      </Box>
    </ChaarvyModal>
  )
}

export default ViewUserProfile
