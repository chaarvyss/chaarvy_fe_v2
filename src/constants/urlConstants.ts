const interPrefix = 'inter'
const interRoutePrefix = {
  admin: `${interPrefix}/admin`,
  auth: `${interPrefix}/auth`,
  fees: `${interPrefix}/fees`,
  list: `${interPrefix}/list`,
  view: `${interPrefix}/view`
}

export const urlConstants = {
  auth: {
    login: `${interRoutePrefix.auth}/login`
  },
  list: {
    addOnCourse: `${interRoutePrefix.list}/addon_courses`,
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
    users: `${interRoutePrefix.list}/users`
  },
  admin: {
    add: {
      feesType: `${interRoutePrefix.admin}/add-fees-type`,
      program: `${interRoutePrefix.admin}/add-program`,
      programSegment: `${interRoutePrefix.admin}/add-program-segment`
    },
    update: {
      feesType: `${interRoutePrefix.admin}/update-fees-type`,
      program: `${interRoutePrefix.admin}/update-program`,
      programStatus: `${interRoutePrefix.admin}/update-program-status`,
      programSegment: `${interRoutePrefix.admin}/update-program-segment`
    }
  },
  fees: {
    getprogramFees: `${interRoutePrefix.fees}/program-fee-detail`,
    updateprogramFees: `${interRoutePrefix.fees}/update_program_fees`,
    createProgramFees: `${interRoutePrefix.fees}/add-program-fees`
  },
  view: {
    programSegments: `${interRoutePrefix.view}/program-segment`
  }
}
