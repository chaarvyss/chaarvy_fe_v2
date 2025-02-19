// import HomeOutline from 'mdi-material-ui/HomeOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/'
      // icon:HomeOutline,
    },
    {
      sectionTitle: 'Admin'
    },
    {
      title: 'Users',
      path: '/Admin/users'
    },
    {
      title: 'Fees types',
      path: '/Admin/feesTypes'
    },
    {
      title: 'Books',
      path: '/Admin/books'
    },
    {
      title: 'Programs',
      path: '/Admin/programs'
    },

    {
      sectionTitle: 'Admissions'
    },

    {
      title: 'New Admission',
      path: '/StudentManagement/AdmissionForm'
    }
  ]
}

export default navigation
