// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { MasterPagePath, PagePath } from 'src/constants/pagePathConstants'
import { Permissions } from 'src/constants/permissions'
import store from 'src/store'

const navigation = (): VerticalNavItemsType => {
  const allowedPermissions = store.getState().permission.data

  const navItems: VerticalNavItemsType = []

  const hadPermission = (key: string) => {
    return (allowedPermissions ?? []).includes(key)
  }

  const client_navs = [
    { key: Permissions.NAV.DASHBOARD, title: 'Dashboard', path: PagePath.DASHBOARD, icon: 'ViewDashboard' as const },
    {
      title: 'Administration',
      icon: 'Cog' as const,
      children: [
        { key: Permissions.NAV.USERS, title: 'Users', path: PagePath.USERS_LIST, icon: 'AccountGroup' as const },
        { key: Permissions.NAV.ROLES, title: 'Roles', path: PagePath.ROLES_LIST, icon: 'ArrangeBringToFront' as const },
        {
          key: Permissions.NAV.FEES_TYPES,
          title: 'Fees types',
          path: PagePath.FEES_TYPES,
          icon: 'FormatListGroup' as const
        },
        {
          key: Permissions.NAV.SECTIONS,
          title: 'Sections',
          path: PagePath.SECTIONS,
          icon: 'ArrangeBringToFront' as const
        },
        { key: Permissions.NAV.BOOKS, title: 'Books & Stationary', path: PagePath.BOOKS, icon: 'Bookshelf' as const },
        { key: Permissions.NAV.ADDON, title: 'Addon Courses', path: PagePath.ADDON_COURSE, icon: 'Offer' as const },
        { key: Permissions.NAV.PROGRAMS, title: 'Programs', path: PagePath.PROGRAMS, icon: 'BullseyeArrow' as const },
        {
          key: Permissions.NAV.PAYMENTS,
          title: 'Payments',
          path: PagePath.PAYMENTS,
          icon: 'AccountCreditCardOutline' as const
        }
      ]
    },
    {
      title: 'Academics',
      icon: 'ChairSchool' as const,
      children: [
        {
          key: Permissions.NAV.TIME_TABLE,
          title: 'Time Table',
          path: PagePath.TIME_TABLE,
          icon: 'Timetable' as const
        }
      ]
    },
    {
      title: 'Student Management',
      icon: 'School' as const,
      children: [
        {
          key: Permissions.NAV.ADMISSION_FORM,
          title: 'Admission form',
          path: PagePath.ADMISSION_FORM,
          icon: 'FormSelect' as const
        },
        {
          key: Permissions.NAV.ADMISSIONS,
          title: 'Admissions',
          path: PagePath.ADMISSIONS,
          icon: 'AccountSchoolOutline' as const
        },
        {
          key: Permissions.NAV.COLLECT_PAYMENT,
          title: 'Collect Payment',
          path: PagePath.COLLECT_PAYMENT,
          icon: 'BankTransferIn' as const
        }
      ]
    },
    {
      title: 'Transport Management',
      icon: 'BusSchool' as const,
      children: [
        {
          key: Permissions.NAV.TRANSPORTATION_DASHBOARD,
          title: 'Dashboard',
          path: PagePath.TRANSPORTATION,
          icon: 'MonitorDashboard' as const
        },
        {
          key: Permissions.NAV.VEHICLE_LIVE_TRACKING,
          title: 'Live Tracking',
          path: PagePath.VEHICLE_LIVE_TRACKING,
          icon: 'MapMarkerRadius' as const
        },
        {
          key: Permissions.NAV.VEHICLE_VENDORS,
          title: 'Vehicle Vendors',
          path: PagePath.VEHICLE_VENDORS,
          icon: 'Handshake' as const
        }
      ]
    },
    {
      title: 'Faculty Corner',
      icon: 'AccountTie' as const,
      children: [
        {
          key: Permissions.NAV.ATTENDENCE_REGISTER,
          title: 'Attendence Register',
          path: PagePath.ATTENDENCE_REGISTER,
          icon: 'AccountCheck' as const
        }
      ]
    }
  ]

  const master_navs = [
    {
      key: Permissions.MASTER.NAV.DASHBOARD,
      title: 'Dashboard',
      path: MasterPagePath.DASHBOARD,
      icon: 'ViewDashboard' as const
    },
    {
      key: Permissions.MASTER.CLIENTS.VIEW_LIST,
      title: 'Clients',
      path: MasterPagePath.CLIENTS_LIST,
      icon: 'FormatListGroup' as const
    }
  ]

  const filterNavItems = (items: any[]): any[] => {
    return items.reduce((filtered: any[], item: any) => {
      const current = { ...item }

      if (current.children?.length) {
        current.children = filterNavItems(current.children)
      }

      const hasPermission = (current.key && hadPermission(current.key)) || current.children?.length > 0

      if (hasPermission) {
        filtered.push(current)
      }

      return filtered
    }, [] as any[])
  }

  const items = [...master_navs, ...client_navs]
  navItems.push(...filterNavItems(items))

  return navItems
}

export default navigation
