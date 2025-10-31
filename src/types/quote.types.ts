export interface QuoteRequest {
  id: string
  patient_id: string
  patient_email: string
  title: string
  description: string
  service_type: string
  status: 'open' | 'closed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  request_id: string
  specialist_id: string
  specialist_email: string
  price: number
  estimated_time: string
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface QuoteRequestWithQuotes extends QuoteRequest {
  quotes: Quote[]
}

