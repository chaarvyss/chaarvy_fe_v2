const interPrefix = 'inter'
const interRoutePrefix = {
  admin: `${interPrefix}/admin`,
  auth: `${interPrefix}/auth`,
  list: `${interPrefix}/list`
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
    states: `${interRoutePrefix.list}/states`,
    users: `${interRoutePrefix.list}/users`
  },
  admin: {
    add: {
      program: `${interRoutePrefix.admin}/add-program`
    },
    update: {
      program: `${interRoutePrefix.admin}/update-program`,
      programStatus: `${interRoutePrefix.admin}/update-program-status`
    }
  }
}
