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
  dashboard: `${interPrefix}/dash_board`,
  template: `${interPrefix}/template`
}

const masterRoutePrefix = {
  admin: `${masterPrefix}/admin`,
  help: `${masterPrefix}/help`
}

export const urlConstants = {
  auth: {
    login: `${interRoutePrefix.auth}/login`,
    changePassword: `${interRoutePrefix.auth}/change-password`,
    updateProfilePic: `${interRoutePrefix.auth}/upload-profile-pic`,
    getResetPasswordCodeUrl: `${interRoutePrefix.auth}/get-reset-password-code`,
    verifyResetCodeUrl: `${interRoutePrefix.auth}/verify-reset-code`,
    resetPasswordUrl: `${interRoutePrefix.auth}/reset-password`
  },
  calender: {
    integrate: `${interRoutePrefix.calender}/login`,
    integrateCallback: `${interRoutePrefix.calender}/callback`,
    eventsList: `${interRoutePrefix.calender}/list-events`
  },
  list: {
    addOnCourse: `${interRoutePrefix.list}/addon_courses`,
    books: `${interRoutePrefix.list}/v2/books`,
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
    getSegementsByProgramAndMediumUrl: `${interRoutePrefix.list}/segments-by-program-medium`,
    getAllPermissionNamesUrl: `${interRoutePrefix.list}/all-permission-names`
  },
  admin: {
    createUpdateUser: `${interRoutePrefix.admin}/create-update-user`,
    createUpdateSection: `${interRoutePrefix.admin}/add-update-section`,
    createUpdateRole: `${interRoutePrefix.admin}/create-update-role`,
    createUpdateSegment: `${interRoutePrefix.admin}/create-update-segment`,
    createUpdateBook: `${interRoutePrefix.admin}/v2/create-update-books`,
    createUpdateFeesType: `${interRoutePrefix.admin}/create-update-fees-type`,
    createUpdateProgramAddonCourse: `${interRoutePrefix.admin}/create-update-program-addon-course`,
    getReferrelSummaryUrl: `${interRoutePrefix.admin}/get_referrals_summary`,

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
    admissionFormOneDetail: `${interRoutePrefix.admisions}/admission-form-one-details`,
    getStudentDetailsF2Url: `${interRoutePrefix.admisions}/get-student-details-f2`,
    getAddonCoursesAvailableForStudentUrl: `${interRoutePrefix.admisions}/addon-courses-available-for-student`,
    getStudentActiveCourseEnrollmentIdUrl: `${interRoutePrefix.admisions}/student-active-course-enrollment-id`,
    studentAddress: `${interRoutePrefix.admisions}/student-address`,
    studentEnrolledAddonCourseUrl: `${interRoutePrefix.admisions}/student-enrolled-addon-courses`,
    enrollAddonCourseUrl: `${interRoutePrefix.admisions}/enroll-addon-courses`,
    getProcessingFees: `${interRoutePrefix.admisions}/get-processing-fees`,
    getActiveProgramSegmentsUrl: `${interRoutePrefix.admisions}/program-segments`,
    getActiveSegmentMediumsUrl: `${interRoutePrefix.admisions}/segment-mediums`,
    getActiveMediumSectionsUrl: `${interRoutePrefix.admisions}/medium-sections`,
    createUpdateAdmissionFormOneUrl: `${interRoutePrefix.admisions}/create-update-admission-form-one`,
    updateStudentDetailsF2Url: `${interRoutePrefix.admisions}/update-student-details-f2`,
    getRawFeesDetailsUrl: `${interRoutePrefix.admisions}/get-raw-fees`,
    setStudentPayableFeesUrl: `${interRoutePrefix.admisions}/set-student-payable-fees`,
    getStudentPayableFeesDetailsUrl: `${interRoutePrefix.admisions}/student-payable-fees`,
    getProcessingFeesPendingEnrollmentsUrl: `${interRoutePrefix.admisions}/processing-fees-pending-enrollments`
  },
  dashboard: {
    studentsCount: `${interRoutePrefix.dashboard}/students_count`,
    lowStationaryStockDetails: `${interRoutePrefix.dashboard}/stationary-stock`,
    studentEnrollmentCountDetails: `${interRoutePrefix.dashboard}/student_enrollments`,
    paymentCountDetails: `${interRoutePrefix.dashboard}/payment_count`
  },
  fees: {
    getprogramFees: `${interRoutePrefix.fees}/program-fee-detail`,
    createUpdateProgramFees: `${interRoutePrefix.fees}/create-update-program-fees`,
    getStudentPayableFees: `${interRoutePrefix.fees}/student-payable-fees`,
    recordPaymentTransaction: `${interRoutePrefix.fees}/record-transaction`,
    paymentRecieptByPaymentId: `${interRoutePrefix.fees}/payment_reciept`,
    getApplicationFeesPaymentLink: `${interRoutePrefix.fees}/get-payment-link`,
    updateProcessingFeesStatusUrl: `${interRoutePrefix.fees}/update-processing-fees-status`,
    getStudentPendingFeesDetailsUrl: `${interRoutePrefix.fees}/get-student-pending-fees-details`,
    getPaymentHistoryUrl: `${interRoutePrefix.fees}/get_payment_history`
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
    createUpdateProgramSegmentSection: `${interRoutePrefix.program}/create-update-program-segment-section`,
    getProgramFeesHeaderDataUrl: `${interRoutePrefix.program}/program-fees-header-data`
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
  template: {
    pdfTemplates: `${interRoutePrefix.template}/get_pdf_templates`,
    addUpdatePdfTemplateUrl: `${interRoutePrefix.template}/add_update_pdf_template`
  },
  master: {
    admin: {
      clientsList: `${masterRoutePrefix.admin}/clients-list`,
      addClient: `${masterRoutePrefix.admin}/add_client?inst_type=inter`
    },
    help: {
      getAllVideos: `${masterRoutePrefix.help}/get-all-help-videos`,
      getUploadUrl: `${masterRoutePrefix.help}/videos/upload-url`,
      getPageHelpVideosUrl: `${masterRoutePrefix.help}/help-videos`,
      getVideoLinkUrl: `${masterRoutePrefix.help}/get-video-url`
    }
  }
}
