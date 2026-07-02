import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'

import api from '../api'
import { CommonCacheTag } from '../cacheTag'

const vendorServiceApi = api.injectEndpoints({
  endpoints: build => ({
    createUpdateVendor: build.mutation<AddVendorResponse, AddVendorRequest>({
      invalidatesTags: [CommonCacheTag.VENDORS_LIST],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.common.vendor.createUpdateVendorUrl,
          body
        }
      }
    }),
    getVendorDetail: build.query<AddVendorRequest, string>({
      query: vendor_id => ({
        method: HttpRequestMethods.GET,
        url: urlConstants.common.vendor.getVendorDetailUrl(vendor_id)
      })
    })
  })
})

export const { useCreateUpdateVendorMutation, useGetVendorDetailQuery } = vendorServiceApi
