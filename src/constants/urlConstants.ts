const interPrefix = 'inter'
const interRoutePrefix = {
  auth: `${interPrefix}/auth`,
  list: `${interPrefix}/list`
}

export const urlConstants = {
  auth: {
    login: `${interRoutePrefix.auth}/login`
  },
  list: {
    users: `${interRoutePrefix.list}/users`,
    programs: `${interRoutePrefix.list}/programs`
  }
}
