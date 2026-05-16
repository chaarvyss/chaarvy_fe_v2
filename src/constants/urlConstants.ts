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
    sectionsList: `${interRoutePrefix.list}/sections`,
    programRelatedBooksOptions: `${interRoutePrefix.list}/program-suited-books-options`,
    getProgramSegmentMediumSectionCombinationUrl: `${interRoutePrefix.list}/program-segment-medium-section-combination`,
    programAddonCourses: `${interRoutePrefix.list}/program-addon-courses`,
    getProgramCommonMediumsUrl: `${interRoutePrefix.list}/get-program-common-mediums`,
    getSegementsByProgramAndMediumUrl: `${interRoutePrefix.list}/segments-by-program-medium`
  },
  admin: {
    createUpdateUser: `${interRoutePrefix.admin}/create-update-user`,
    createUpdateSection: `${interRoutePrefix.admin}/add-update-section`,
    createUpdateRole: `${interRoutePrefix.admin}/create-update-role`,
    createUpdateSegment: `${interRoutePrefix.admin}/create-update-segment`,
    createUpdateBook: `${interRoutePrefix.admin}/create-update-books`,
    createUpdateFeesType: `${interRoutePrefix.admin}/create-update-fees-type`,
    createUpdateProgramAddonCourse: `${interRoutePrefix.admin}/create-update-program-addon-course`,
    add: {
      addonCourse: `${interRoutePrefix.admin}/add-addon-course`,
      language: `${interRoutePrefix.admin}/add-language`,
      program: `${interRoutePrefix.admin}/add-program`,
      programAddon: `${interRoutePrefix.admin}/add-program-addon-course`,
      programSegment: `${interRoutePrefix.admin}/add-program-segment`,
      createUpdateAddress: `${interRoutePrefix.admin}/create-update-address`
    },
    get: {
      userPermissions: `${interRoutePrefix.admin}/user-permissions`
    },
    update: {
      addonCourse: `${interRoutePrefix.admin}/update-addon-course`,
      addonCourseStatus: `${interRoutePrefix.admin}/update-addon-course-status`,
      language: `${interRoutePrefix.admin}/update-language`,
      program: `${interRoutePrefix.admin}/update-program`,
      programAddon: `${interRoutePrefix.admin}/update-program-addon-course`,
      programStatus: `${interRoutePrefix.admin}/update-program-status`,
      programSegment: `${interRoutePrefix.admin}/update-program-segment`,
      collegeProfile: `${interRoutePrefix.admin}/update-mydetails`,
      collgeLogo: `${interRoutePrefix.admin}/update-college-logo`,
      userStatus: `${interRoutePrefix.admin}/update-user-status`,
      updateUserPermissions: `${interRoutePrefix.admin}/update-user-permission`,
      programSegmentStatus: `${interRoutePrefix.admin}/update-program-segment-status`
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
    programSegmentMediumBooks: `${interRoutePrefix.program}/program-segment-medium-books`,
    getProgramSecondLanguages: `${interRoutePrefix.program}/program-second-language`,
    getProgramSegmentMediumsByProgramId: `${interRoutePrefix.program}/program-segment-mediums-list`,
    getProgramSections: `${interRoutePrefix.program}/program-sections`,
    getProgramSegmentMediums: `${interRoutePrefix.program}/program-segment-mediums`,
    updateProgramSecondLanguages: `${interRoutePrefix.program}/update-program-second-language`,
    updateProgramMediums: `${interRoutePrefix.program}/update-program-mediums`,
    updateProgramSections: `${interRoutePrefix.program}/update-program-sections`,
    createUpdateProgramBook: `${interRoutePrefix.program}/create-update-program-book`,
    createUpdateProgramSegmentMedium: `${interRoutePrefix.program}/create-update-program-segment-medium`,
    createUpdateProgramSegmentSection: `${interRoutePrefix.program}/create-update-program-segment-section`
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
