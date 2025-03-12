// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'ViewDashboard'
    },
    {
      title: 'College Profile',
      path: '/collegeProfile',
      icon: 'FaceManProfile'
    },
    {
      sectionTitle: 'Admin'
    },
    // {
    //   title: 'Users',
    //   path: '/Admin/users',
    //   icon: 'AccountGroup'
    // },
    {
      title: 'Fees types',
      path: '/Admin/feesTypes',
      icon: 'FormatListGroup'
    },
    {
      title: 'Books',
      path: '/Admin/books',
      icon: 'Bookshelf'
    },
    {
      title: 'Addon Courses',
      path: '/Admin/addonCourse',
      icon: 'Offer'
    },
    {
      title: 'Programs',
      path: '/Admin/programs',
      icon: 'BullseyeArrow'
    },
    {
      title: 'Payments',
      path: '/Admin/payments',
      icon: 'AccountCreditCardOutline'
    },

    {
      sectionTitle: 'Admissions'
    },

    {
      title: 'Admission form',
      path: '/StudentManagement/AdmissionForm',
      icon: 'FormSelect'
    },
    {
      title: 'Admissions',
      path: '/StudentManagement/Admissions',
      icon: 'AccountSchoolOutline'
    },
    {
      title: 'Collect Payment',
      path: '/StudentManagement/Payments/collectPayment',
      icon: 'BankTransferIn'
    }
  ]
}

export default navigation
