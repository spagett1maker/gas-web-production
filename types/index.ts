// Database types
export interface Profile {
  id: string
  phone: string
  default_store_id?: string
  created_at?: string
  updated_at?: string
}

export interface Store {
  id: string
  user_id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  created_at?: string
  updated_at?: string
}

export interface Service {
  id: string
  name: string
  description?: string
  created_at?: string
}

export interface ServiceRequest {
  id: string
  user_id: string
  store_id: string
  service_id: string
  status: string
  created_at: string
  updated_at: string
  services?: Service
  stores?: Store
  request_details?: RequestDetail[]
}

export interface RequestDetail {
  id: string
  request_id: string
  key: string
  value: string
  created_at?: string
}

export interface Inquiry {
  id: string
  user_id: string
  store_id?: string
  title: string
  content: string
  category: string
  priority: string
  status?: string
  created_at: string
  updated_at?: string
  stores?: Store
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

// UI types
export interface SearchResult {
  address_name: string
  place_name?: string
  road_address_name?: string
  x: string // longitude
  y: string // latitude
}

export interface SelectedItem {
  [key: string]: number
}
