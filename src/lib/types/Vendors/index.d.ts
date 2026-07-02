type AddVendorRequest = {
  vendor_id?: string
  vendor_name: string
  vendor_firm_name: string
  contact_number: string
  email: string
}

type AddVendorResponse = {
  message: string
  vendor_id: string
}
