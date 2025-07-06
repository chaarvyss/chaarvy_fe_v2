// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { MasterPagePath, PagePath } from 'src/constants/pagePathConstants'
import { Permissions } from 'src/constants/permissions'

import store from 'src/store'

const navigation = (): VerticalNavItemsType => {
  const allowedPermissions = store.getState().permission.data

  let navItems: VerticalNavItemsType = []

  const hadPermission = (key: string) => {
    return (allowedPermissions ?? []).includes(key)
  }

  const client_navs = [
    { key: Permissions.NAV.DASHBOARD, title: 'Dashboard', path: PagePath.DASHBOARD, icon: 'ViewDashboard' as const },
    {
      key: Permissions.NAV.COLLEGE_PROFILE,
      title: 'College Profile',
      path: '/collegeProfile',
      icon: 'FaceManProfile' as const
    },
    {
      key: Permissions.NAV.USERS,
      title: 'Users',
      path: '/Admin/users',
      icon: 'AccountGroup' as const
    },
    { key: Permissions.NAV.ROLES, title: 'Roles', path: '/Admin/roles', icon: 'ArrangeBringToFront' as const },

    {
      key: Permissions.NAV.FEES_TYPES,
      title: 'Fees types',
      path: '/Admin/feesTypes',
      icon: 'FormatListGroup' as const
    },
    { key: Permissions.NAV.SECTIONS, title: 'Sections', path: '/Admin/sections', icon: 'ArrangeBringToFront' as const },
    { key: Permissions.NAV.BOOKS, title: 'Books & Stationary', path: '/Admin/books', icon: 'Bookshelf' as const },
    { key: Permissions.NAV.ADDON, title: 'Addon Courses', path: '/Admin/addonCourse', icon: 'Offer' as const },
    { key: Permissions.NAV.PROGRAMS, title: 'Programs', path: '/Admin/programs', icon: 'BullseyeArrow' as const },

    {
      key: Permissions.NAV.ADMISSION_FORM,
      title: 'Admission form',
      path: '/StudentManagement/AdmissionForm',
      icon: 'FormSelect' as const
    },
    {
      key: Permissions.NAV.ADMISSIONS,
      title: 'Admissions',
      path: '/StudentManagement/Admissions',
      icon: 'AccountSchoolOutline' as const
    },
    {
      key: Permissions.NAV.COLLECT_PAYMENT,
      title: 'Collect Payment',
      path: '/StudentManagement/Payments/collectPayment',
      icon: 'BankTransferIn' as const
    },
    {
      key: Permissions.NAV.PAYMENTS,
      title: 'Payments',
      path: '/Admin/payments',
      icon: 'AccountCreditCardOutline' as const
    },

    {
      key: Permissions.NAV.ATTENDENCE_REGISTER,
      title: 'Attendence Register',
      path: '/Faculty/attendence',
      icon: 'AccountCheck' as const
    }
  ]

  const master_navs = [
    {
      key: Permissions.MASTER.NAV.DASHBOARD,
      title: 'Dashboard',
      path: PagePath.MASTER_DASHBOARD,
      icon: 'ViewDashboard' as const
    },
    {
      key: Permissions.MASTER.CLIENTS.VIEW_LIST,
      title: 'Clients',
      path: MasterPagePath.CLIENTS_LIST,
      icon: 'FormatListGroup' as const
    }
  ]

  const items = [...master_navs, ...client_navs]
  navItems.push(...items.filter(item => hadPermission(item.key)))

  return navItems
}

export default navigation
