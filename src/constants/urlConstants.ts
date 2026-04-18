const interPrefix = 'inter'
const masterPrefix = 'master'
const interRoutePrefix = {
  admin: `${interPrefix}/admin`,
  admisions: `${interPrefix}/admissions`,
  auth: `${interPrefix}/auth`,
  calender: `${interPrefix}/google-calender`,
  fees: `${interPrefix}/fees`,
  list: `${interPrefix}/list`,
  program: `${interPrefix}/program`,
  view: `${interPrefix}/view`,
  dashboard: `${interPrefix}/dash_board`
}

const masterRoutePrefix = {
  admin: `${masterPrefix}/admin`
}

export const urlConstants = {
  auth: {
    login: `${interRoutePrefix.auth}/login`,
    changePassword: `${interRoutePrefix.auth}/change-password`,
    updateProfilePic: `${interRoutePrefix.auth}/upload-profile-pic`
  },
  calender: {
    integrate: `${interRoutePrefix.calender}/login`,
    integrateCallback: `${interRoutePrefix.calender}/callback`,
    eventsList: `${interRoutePrefix.calender}/list-events`
  },
  list: {
    addOnCourse: `${interRoutePrefix.list}/addon_courses`,
    books: `${interRoutePrefix.list}/books`,
    communities: `${interRoutePrefix.list}/communities`,
    districts: `${interRoutePrefix.list}/districts`,
    feesTypes: `${interRoutePrefix.list}/fee-types`,
    genders: `${interRoutePrefix.list}/genders`,
    languages: `${interRoutePrefix.list}/languages`,
    occupations: `${interRoutePrefix.list}/occupations`,
    programs: `${interRoutePrefix.list}/programs`,
    qualifiedExams: `${interRoutePrefix.list}/qualified-exams`,
    religions: `${interRoutePrefix.list}/religions`,
    segments: `${interRoutePrefix.list}/segments`,
    students: `${interRoutePrefix.list}/students-list`,
    states: `${interRoutePrefix.list}/states`,
    users: `${interRoutePrefix.list}/users`,
    paymentModes: `${interRoutePrefix.list}/payment-modes`,
    paymentAggrements: `${interRoutePrefix.list}/payment-aggrements`,
    roles: `${interRoutePrefix.list}/roles`,
    role_permissions: `${interRoutePrefix.list}/role_permissions`,
    studentPaymentsList: `${interRoutePrefix.list}/student-payments`,
    sectionsList: `${interRoutePrefix.list}/sections`
  },
  admin: {
    createUpdateUser: `${interRoutePrefix.admin}/create-update-user`,
    createUpdateSection: `${interRoutePrefix.admin}/add-update-section`,
    createUpdateRole: `${interRoutePrefix.admin}/create-update-role`,
    createUpdateSegment: `${interRoutePrefix.admin}/add-update-segment`,
    add: {
      addonCourse: `${interRoutePrefix.admin}/add-addon-course`,
      book: `${interRoutePrefix.admin}/add-book`,
      feesType: `${interRoutePrefix.admin}/add-fees-type`,
      language: `${interRoutePrefix.admin}/add-language`,
      program: `${interRoutePrefix.admin}/add-program`,
      programAddon: `${interRoutePrefix.admin}/add-program-addon-course`,
      programBook: `${interRoutePrefix.admin}/add-program-book`,
      programSegment: `${interRoutePrefix.admin}/add-program-segment`,
      createUpdateAddress: `${interRoutePrefix.admin}/create-update-address`
    },
    get: {
      userPermissions: `${interRoutePrefix.admin}/user-permissions`
    },
    update: {
      addonCourse: `${interRoutePrefix.admin}/update-addon-course`,
      addonCourseStatus: `${interRoutePrefix.admin}/update-addon-course-status`,
      book: `${interRoutePrefix.admin}/update-book`,
      feesType: `${interRoutePrefix.admin}/update-fees-type`,
      language: `${interRoutePrefix.admin}/update-language`,
      program: `${interRoutePrefix.admin}/update-program`,
      programAddon: `${interRoutePrefix.admin}/update-program-addon-course`,
      programBook: `${interRoutePrefix.admin}/update-program-book`,
      programStatus: `${interRoutePrefix.admin}/update-program-status`,
      programSegment: `${interRoutePrefix.admin}/update-program-segment`,
      collegeProfile: `${interRoutePrefix.admin}/update-mydetails`,
      collgeLogo: `${interRoutePrefix.admin}/update-college-logo`,
      userStatus: `${interRoutePrefix.admin}/update-user-status`,
      updateUserPermissions: `${interRoutePrefix.admin}/update-user-permission`
    },
    delete: {
      programBook: `${interRoutePrefix.admin}/delete-program-book`
    }
  },
  admissions: {
    createAdmission: `${interRoutePrefix.admisions}/create-update-admission`,
    uploadStudentPhoto: `${interRoutePrefix.admisions}/upload-student-photo`,
    admissionsList: `${interRoutePrefix.admisions}/admissions-list`,
    admissionDetail: `${interRoutePrefix.admisions}/admission-details`,
    studentAddress: `${interRoutePrefix.admisions}/student-address`,
    createStudentAddress: `${interRoutePrefix.admisions}/create-update-student-address`,
    studentEnrolledAddonCourse: `${interRoutePrefix.admisions}/student-enrolled-addon-courses`,
    enrollAddonCourse: `${interRoutePrefix.admisions}/enroll-addon-courses`,
    getProcessingFees: `${interRoutePrefix.admisions}/get-processing-fees`
  },
  dashboard: {
    studentsCount: `${interRoutePrefix.dashboard}/students_count`,
    lowStationaryStockDetails: `${interRoutePrefix.dashboard}/stationary-stock`,
    studentEnrollmentCountDetails: `${interRoutePrefix.dashboard}/student_enrollments`,
    paymentCountDetails: `${interRoutePrefix.dashboard}/payment_count`
  },
  fees: {
    getprogramFees: `${interRoutePrefix.fees}/program-fee-detail`,
    updateprogramFees: `${interRoutePrefix.fees}/update_program_fees`,
    createProgramFees: `${interRoutePrefix.fees}/add-program-fees`,
    getStudentAdmissionFees: `${interRoutePrefix.fees}/actual-overall-payable-fees`,
    createStudentPayableFees: `${interRoutePrefix.fees}/add-student-payable-fees`,
    getStudentPayableFees: `${interRoutePrefix.fees}/student-payable-fees`,
    getStudentPendingFees: `${interRoutePrefix.fees}/student-pending-payment`,
    recordPaymentTransaction: `${interRoutePrefix.fees}/record-transaction`,
    paymentRecieptByPaymentId: `${interRoutePrefix.fees}/payment_reciept`,
    getApplicationFeesPaymentLink: `${interRoutePrefix.fees}/get-payment-link`,
    updateApplicationFeesPayment: `${interRoutePrefix.fees}/update-application-payment`
  },
  program: {
    programAddon: `${interRoutePrefix.program}/program-addon-course`,
    programBooks: `${interRoutePrefix.program}/program-book-detail`,
    getProgramSecondLanguages: `${interRoutePrefix.program}/program-second-language`,
    getProgramMediums: `${interRoutePrefix.program}/program-mediums`,
    getProgramSections: `${interRoutePrefix.program}/program-sections`,
    updateProgramSecondLanguages: `${interRoutePrefix.program}/update-program-second-language`,
    updateProgramMediums: `${interRoutePrefix.program}/update-program-mediums`,
    updateProgramSections: `${interRoutePrefix.program}/update-program-sections`
  },
  view: {
    programSegments: `${interRoutePrefix.view}/program-segment`,
    myDetails: `${interRoutePrefix.view}/my-details`,
    paymentDetail: `${interRoutePrefix.view}/payment-details`,
    address: `${interRoutePrefix.view}/address`,
    userProfile: `${interRoutePrefix.view}/user_base_details`,
    userCalender: `${interRoutePrefix.view}/user_calender`,
    viewVehicleDetails: `${interRoutePrefix.view}/vehicle-details`,
    viewRouteDetails: `${interRoutePrefix.view}/route-details`
  },

  master: {
    admin: {
      clientsList: `${masterRoutePrefix.admin}/clients-list`,
      addClient: `${masterRoutePrefix.admin}/add_client?inst_type=inter`
    }
  }
}
