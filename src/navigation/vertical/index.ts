// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { MasterPagePath, PagePath } from 'src/constants/pagePathConstants'
import { PermissionLabels, Permissions } from 'src/constants/permissions'
import { isAuthorised } from 'src/lib/util/permissionCheck'

const navigation = (): VerticalNavItemsType => {
  const navItems: VerticalNavItemsType = []

  const client_navs = [
    {
      key: PermissionLabels.nav.dashboard,
      title: 'Dashboard',
      path: PagePath.DASHBOARD,
      icon: 'ViewDashboard' as const
    },
    {
      title: 'Administration',
      icon: 'Cog' as const,
      children: [
        {
          key: PermissionLabels.nav.collegeProfile,
          title: 'College Profile',
          path: PagePath.COLLEGE_PROFILE,
          icon: 'TownHall' as const
        },
        { key: PermissionLabels.nav.users, title: 'Users', path: PagePath.USERS_LIST, icon: 'AccountGroup' as const },
        {
          key: PermissionLabels.nav.roles,
          title: 'Roles',
          path: PagePath.ROLES_LIST,
          icon: 'ArrangeBringToFront' as const
        },
        {
          key: PermissionLabels.nav.feesTypes,
          title: 'Fees types',
          path: PagePath.FEES_TYPES,
          icon: 'FormatListGroup' as const
        },
        {
          key: PermissionLabels.nav.sections,
          title: 'Sections',
          path: PagePath.SECTIONS,
          icon: 'ArrangeBringToFront' as const
        },
        {
          key: PermissionLabels.nav.programs,
          title: 'Programs',
          path: PagePath.PROGRAMS,
          icon: 'BullseyeArrow' as const
        },
        {
          key: PermissionLabels.nav.booksAndStationary,
          title: 'Books & Stationary',
          path: PagePath.BOOKS,
          icon: 'Bookshelf' as const
        },
        {
          key: PermissionLabels.nav.addonCourses,
          title: 'Addon Courses',
          path: PagePath.ADDON_COURSE,
          icon: 'Offer' as const
        },
        {
          key: PermissionLabels.nav.payments,
          title: 'Payments',
          path: PagePath.PAYMENTS,
          icon: 'AccountCreditCardOutline' as const
        }
      ]
    },

    // {
    //   title: 'Academics',
    //   icon: 'ChairSchool' as const,
    //   children: [
    //     {
    //       key: PermissionLabels.nav.TIME_TABLE,
    //       title: 'Time Table',
    //       path: PagePath.TIME_TABLE,
    //       icon: 'Timetable' as const
    //     }
    //   ]
    // },
    {
      title: 'Student Management',
      icon: 'School' as const,
      children: [
        // {
        //   key: PermissionLabels.nav.admissionForm,
        //   title: 'Admission form',
        //   path: PagePath.ADMISSION_FORM,
        //   icon: 'FormSelect' as const
        // },
        {
          key: PermissionLabels.nav.admissions,
          title: 'Admissions',
          path: PagePath.ADMISSIONS,
          icon: 'AccountSchoolOutline' as const
        },
        {
          key: PermissionLabels.nav.collectPayment,
          title: 'Collect Payment',
          path: PagePath.COLLECT_PAYMENT,
          icon: 'BankTransferIn' as const
        }
      ]
    }

    // {
    //   title: 'Transport Management',
    //   icon: 'BusSchool' as const,
    //   children: [
    //     {
    //       key: PermissionLabels.nav.TRANSPORTATION_DASHBOARD,
    //       title: 'Dashboard',
    //       path: PagePath.TRANSPORTATION,
    //       icon: 'MonitorDashboard' as const
    //     },
    //     {
    //       key: PermissionLabels.nav.VEHICLE_LIVE_TRACKING,
    //       title: 'Live Tracking',
    //       path: PagePath.VEHICLE_LIVE_TRACKING,
    //       icon: 'MapMarkerRadius' as const
    //     },
    //     {
    //       key: PermissionLabels.nav.VEHICLE_VENDORS,
    //       title: 'Vehicle Vendors',
    //       path: PagePath.VEHICLE_VENDORS,
    //       icon: 'Handshake' as const
    //     }
    //   ]
    // },
    // {
    //   title: 'Faculty Corner',
    //   icon: 'AccountTie' as const,
    //   children: [
    //     {
    //       key: PermissionLabels.nav.ATTENDENCE_REGISTER,
    //       title: 'Attendence Register',
    //       path: PagePath.ATTENDENCE_REGISTER,
    //       icon: 'AccountCheck' as const
    //     }
    //   ]
    // }
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

      const hasPermission = (current.key && isAuthorised(current.key)) || current.children?.length > 0

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
