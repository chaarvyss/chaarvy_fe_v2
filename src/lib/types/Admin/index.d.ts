type Vendor = {
  vendor_id?: string
  vendor_name: string
  vendor_firm_name: string
  contact_number: string
  email: string
}

type VendorsListResponse = {
  filtered: number
  total: number
  vendors: Vendor[]
}
