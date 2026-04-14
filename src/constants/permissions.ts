export const Permissions = {
  MASTER: {
    NAV: {
      DASHBOARD: 'a07d2d6e-8431-4527-9857-c7d155715002'
    },
    CLIENTS: {
      VIEW_LIST: '49e4596b-0888-4a9d-931f-d03352c56536'
    }
  },

  ROLE: {
    CREATE_ROLE: '6660878a-d015-11ef-af72-842afd127d37',
    UPDATE_ROLE: '6660ac0d-d015-11ef-af72-842afd127d37',
    UPDATE_ROLE_STATUS: '6660b6a2-d015-11ef-af72-842afd127d37',
    LIST_ACTIVE_ROLES: '66610e7a-d015-11ef-af72-842afd127d37',
    LIST_ALL_ROLES: '66611929-d015-11ef-af72-842afd127d37',
    VIEW_ROLE_DETAIL: '666126c8-d015-11ef-af72-842afd127d37'
  },
  USER: {
    CREATE_USER: '66614622-d015-11ef-af72-842afd127d37',
    UPDATE_USER: '66614f85-d015-11ef-af72-842afd127d37',
    UPDATE_USER_PERMISSIONS: '66613c29-d015-11ef-af72-842afd127d37',
    SHOW_USERS_LIST: '321c919e-d9b9-11ef-af72-842afd127d37'
  },
  LIST_ALL_PERMISSIONS: '666131da-d015-11ef-af72-842afd127d37',
  NAV: {
    DASHBOARD: '778996b4-fd0e-4729-a974-66cb36d49a35',
    COLLEGE_PROFILE: '88000221-f992-4ee5-b3c5-3e3d98c00e67',
    USERS: 'df1e7a17-f15f-4d8a-a86e-26c1cb8bae1a',
    FEES_TYPES: '331c3cdf-a18e-4a61-9f44-4f6fd8629ec9',
    SECTIONS: '621a1991-f355-4d17-82f8-fe58d9f76c69',
    BOOKS: '7f41f79c-2ef3-47f2-9e0a-eee4c8c7de17',
    ADDON: 'a6699168-fe6c-4992-b9de-42539962c1f6',
    PROGRAMS: 'f12d4a45-c975-4c1b-a4c5-98726ee8ae8e',
    PAYMENTS: '20d150b1-68d4-4a59-824f-90418740a8fc',
    ADMISSION_FORM: 'd7d07152-b7e8-4409-ba6e-c44221ebcfef',
    ADMISSIONS: '07c5ab7a-2570-4d67-b76c-025eccb663fa',
    COLLECT_PAYMENT: '8d15d23d-dad8-47b9-b6aa-14cb1204c292',
    ATTENDENCE_REGISTER: 'cf2eefaa-5053-4ba2-84cc-ce033ae34851',
    ROLES: '84d30bbf-e4fb-4888-b6f0-0568bf9df1b0',

    TRANSPORTATION_DASHBOARD: 'df1e7a17-f15f-4d8a-a86e-26c1cb8bae1a', // need to update with actual permission id
    VEHICLE_LIVE_TRACKING: 'df1e7a17-f15f-4d8a-a86e-26c1cb8bae1a', // need to update with actual permission id
    VEHICLE_VENDORS: 'df1e7a17-f15f-4d8a-a86e-26c1cb8bae1a', // need to update with actual permission id
    DRIVERS: '',
    VEHICLES: '',
    ROUTES: '',
    BOARDING_POINTS: '',
    VEHICLE_MOMENTS: ''
  }
}
