export const Permissions = {
  MASTER: {
    NAV: {
      DASHBOARD: 'a07d2d6e-8431-4527-9857-c7d155715002',
      HELP_VIDEOS: '49e4596b-0888-4a9d-931f-d03352c56536'
    },
    CLIENTS: {
      VIEW_LIST: '49e4596b-0888-4a9d-931f-d03352c56536'
    }
  }
}

export const PermissionLabels = {
  nav: {
    dashboard: 'nav:dashboard',
    collegeProfile: 'nav:college_profile',
    users: 'nav:users',
    roles: 'nav:roles',
    feesTypes: 'nav:fees_types',
    sections: 'nav:sections',
    programs: 'nav:programs',
    subjects: 'nav:subjects',
    booksAndStationary: 'nav:books_and_stationary',
    addonCourses: 'nav:addon_courses',
    payments: 'nav:payments',
    admissions: 'nav:admissions',
    collectPayment: 'nav:collect_payment',
    referrels: 'nav:referrels',
    reports: 'nav:reports',
    expenses: 'nav:expenses',
    vendors: 'nav:vendors'
  },
  dashboard: {
    studentCount: 'dashboard:student_count',
    payments: 'dashboard:payments',
    stationaryStock: 'dashboard:stationary_stock',
    studentEnrollments: 'dashboard:student_enrollments',
    cashFlow: 'dashboard:cashflow',
    expenses: 'dashboard:expenses',
    todo: 'dashboard:todo'
  },
  collegeProfile: {
    collegeIconView: 'college_profile:icon:view',
    collegeIconUpdate: 'college_profile:icon:update',
    detailsView: 'college_profile:details:view',
    addressView: 'college_profile:address:view',
    detailsEdit: 'college_profile:details:edit',
    addressEdit: 'college_profile:address:edit'
  },
  users: {
    addUser: 'users:add_user',
    filters: {
      searchUser: 'users:filter:search',
      searchByStatus: 'users:filter:search_by_status',
      searchByRole: 'users:filter:search_by_role'
    },
    list: {
      view: 'users:list:view',
      statusUpdate: 'users:status:update'
    },
    userProfile: {
      avatarView: 'users:user_profile:avatar:view',
      avatarUpdate: 'users:user_profile:avatar:update',
      view: 'users:user_profile:details:view',
      update: 'users:user_profile:details:update'
    },
    userAddress: {
      view: 'users:user_address:view',
      update: 'users:user_address:update'
    },
    userPermissions: {
      view: 'users:user_permissions:view',
      update: 'users:user_permissions:update'
    }
  },
  roles: {
    createRole: 'roles:create_role',
    updateRoleName: 'roles:update:role_name',
    roleDefaultPermissions: {
      view: 'roles:view:role_default_permissions',
      update: 'roles:update:role_default_permissions'
    },
    list: {
      view: 'roles:list:view'
    }
  },
  feesTypes: {
    createFeesType: 'fees_types:create:fees_type',
    list: {
      view: {
        active: 'fees_types:list:view:active',
        inactive: 'fees_types:list:view:inactive'
      }
    },
    update: {
      feesTypeName: 'fees_types:update:fees_type_name',
      feesTypeStatus: 'fees_types:update:fees_type_status'
    }
  },
  sections: {
    createSection: 'sections:create:section',
    list: {
      view: {
        active: 'sections:list:view:active',
        inactive: 'sections:list:view:inactive'
      }
    },
    update: {
      sectionName: 'sections:update:section_name',
      sectionStatus: 'sections:update:section_status'
    }
  },
  programs: {
    createProgram: 'programs:create:program',
    list: {
      view: {
        active: 'programs:list:view:active',
        inactive: 'programs:list:view:inactive',
        kebab: {
          programDetails: 'programs:list:view:kebab:program_details',
          editProgramName: 'programs:list:view:kebab:edit_program_name',
          booksDetails: 'programs:list:view:kebab:books_details',
          feesDetails: 'programs:list:view:kebab:fees_details'
        }
      }
    },
    update: {
      programName: 'programs:update:program_name',
      programStatus: 'programs:update:program_status'
    },
    programDetails: {
      programSegments: {
        view: 'programs:program_details:program_segments:view',
        update: 'programs:program_details:program_segments:update'
      },
      programMediums: {
        view: 'programs:program_details:program_mediums:view',
        update: 'programs:program_details:program_mediums:update'
      },
      programSections: {
        view: 'programs:program_details:program_sections:view',
        update: 'programs:program_details:program_sections:update'
      }
    },
    programBooks: {
      view: 'programs:program_books:view',
      update: 'programs:program_books:update'
    },
    programFees: {
      view: 'programs:program_fees:view',
      update: 'programs:program_fees:update'
    }
  },
  booksAndStationary: {
    addItem: 'books_and_stationary:add_item',
    list: {
      view: {
        active: 'books_and_stationary:list:view:active',
        inactive: 'books_and_stationary:list:view:inactive'
      }
    },
    update: {
      bookDetails: 'books_and_stationary:update:book_details'
    }
  },
  addonCourses: {
    create: 'addon_courses:create',
    list: {
      view: {
        active: 'addon_courses:list:view:active',
        inactive: 'addon_courses:list:view:inactive'
      }
    },
    view: {
      addonCourseDetails: 'addon_courses:view:addon_course_details'
    },
    update: {
      addonCourseName: 'addon_courses:update:addon_course_name',
      addonCourseAvailability: 'addon_courses:update:addon_course_availability'
    }
  },
  payments: {
    list: {
      view: {
        success: 'payments:list:view:success',
        pending: 'payments:list:view:pending'
      }
    },
    paymentDetails: {
      view: 'payments:payment_details:view',
      printReceipt: 'payments:payment_details:print_receipt'
    }
  },
  admissions: {
    list: {
      view: {
        active: 'admissions:list:view:active',
        inactive: 'admissions:list:view:inactive'
      }
    },
    createAdmission: 'admissions:create_admission',
    updateAdmissionStatus: 'admissions:update_admission_status',
    printAdmissionLetter: 'admissions:print_admission_letter',
    admissionDetails: {
      view: {
        admissionBaseDetails: 'admissions:admission_details:view:admission_base_details',
        admissionDetails: 'admissions:admission_details:view:admission_details',
        admissionAddress: 'admissions:admission_details:view:admission_address',
        admissionAddonCourses: 'admissions:admission_details:view:admission_addon_courses',
        admissionFeesDetails: 'admissions:admission_details:view:admission_fees_details'
      },
      update: {
        admissionBaseDetails: 'admissions:admission_details:update:admission_base_details',
        admissionDetails: 'admissions:admission_details:update:admission_details',
        admissionAddress: 'admissions:admission_details:update:admission_address',
        admissionAddonCourses: 'admissions:admission_details:update:admission_addon_courses',
        admissionFeesDetails: 'admissions:admission_details:update:admission_fees_details'
      }
    }
  },
  collectPayment: {
    searchPendingPayment: 'collect_payment:search_pending_payment',
    acceptPayment: 'collect_payment:accept_payment',
    viewPaymentDetails: 'collect_payment:view_payment_details',
    printReceipt: 'collect_payment:print_receipt'
  },
  referrels: {
    viewList: 'referrels:view:list'
  },
  reports: {
    download: {
      studentAdmissionsReport: 'reports:download:studentAdmissionsReport'
    }
  },
  expenses: {
    add: 'expenses:add',
    edit: 'expenses:edit',
    view: {
      list: 'expenses:view:list'
    }
  }
}
