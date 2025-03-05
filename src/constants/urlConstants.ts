const interPrefix = 'inter'
const interRoutePrefix = {
  admin: `${interPrefix}/admin`,
  admisions: `${interPrefix}/admissions`,
  auth: `${interPrefix}/auth`,
  fees: `${interPrefix}/fees`,
  list: `${interPrefix}/list`,
  program: `${interPrefix}/program`,
  view: `${interPrefix}/view`
}

export const urlConstants = {
  auth: {
    login: `${interRoutePrefix.auth}/login`,
    changePassword: `${interRoutePrefix.auth}/change-password`
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
    states: `${interRoutePrefix.list}/states`,
    users: `${interRoutePrefix.list}/users`,
    paymentModes: `${interRoutePrefix.list}/payment-modes`
  },
  admin: {
    add: {
      addonCourse: `${interRoutePrefix.admin}/add-addon-course`,
      book: `${interRoutePrefix.admin}/add-book`,
      feesType: `${interRoutePrefix.admin}/add-fees-type`,
      language: `${interRoutePrefix.admin}/add-language`,
      program: `${interRoutePrefix.admin}/add-program`,
      programAddon: `${interRoutePrefix.admin}/add-program-addon-course`,
      programBook: `${interRoutePrefix.admin}/add-program-book`,
      programSegment: `${interRoutePrefix.admin}/add-program-segment`
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
      programSegment: `${interRoutePrefix.admin}/update-program-segment`
    }
  },
  admissions: {
    createAdmission: `${interRoutePrefix.admisions}/create-update-admission`,
    uploadStudentPhoto: `${interRoutePrefix.admisions}/upload-student-photo`,
    admissionsList: `${interRoutePrefix.admisions}/admissions-list`,
    admissionDetail: `${interRoutePrefix.admisions}/admission-details`,
    studentEnrolledAddonCourse: `${interRoutePrefix.admisions}/student-enrolled-addon-courses`,
    enrollAddonCourse: `${interRoutePrefix.admisions}/enroll-addon-courses`
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
    paymentRecieptByPaymentId: `${interRoutePrefix.fees}/payment_reciept`
  },
  program: {
    programAddon: `${interRoutePrefix.program}/program-addon-course`,
    programBooks: `${interRoutePrefix.program}/program-book-detail`,
    getProgramSecondLanguages: `${interRoutePrefix.program}/program-second-language`,
    getProgramMediums: `${interRoutePrefix.program}/program-mediums`,
    updateProgramSecondLanguages: `${interRoutePrefix.program}/update-program-second-language`,
    updateProgramMediums: `${interRoutePrefix.program}/update-program-mediums`
  },
  view: {
    programSegments: `${interRoutePrefix.view}/program-segment`
  }
}
