import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAppSelector } from '../store/hooks'
import type { QuoteRequest, Quote } from '../types/quote.types'

interface RequestWithQuotes extends QuoteRequest {
  quotes: Quote[]
}

export default function MyQuotes() {
  const { user } = useAppSelector((state) => state.auth)
  const [requests, setRequests] = useState<RequestWithQuotes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuoteRequests()
  }, [user])

  const fetchQuoteRequests = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch quote requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      if (requestsError) throw requestsError

      // Fetch quotes for each request
      const requestsWithQuotes = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: quotesData } = await supabase
            .from('quotes')
            .select('*')
            .eq('request_id', request.id)
            .order('created_at', { ascending: false })

          return {
            ...request,
            quotes: quotesData || []
          }
        })
      )

      setRequests(requestsWithQuotes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading quotes')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { label: 'Open', className: 'badge-open' },
      closed: { label: 'Closed', className: 'badge-closed' },
      cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
      pending: { label: 'Pending', className: 'badge-pending' },
      accepted: { label: 'Accepted', className: 'badge-accepted' },
      rejected: { label: 'Rejected', className: 'badge-rejected' }
    }
    
    const badge = badges[status as keyof typeof badges] || badges.pending
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading quotes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={fetchQuoteRequests} className="btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>You have no requests yet</h3>
        <p>Create your first request in the "Request Quote" tab</p>
      </div>
    )
  }

  return (
    <div className="my-quotes-container">
      <div className="my-quotes-header">
        <h2>My Requests</h2>
        <p>Here you can see all your requests and the offers received</p>
      </div>

      <div className="requests-list">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div>
                <h3>{request.title}</h3>
                <p className="request-meta">
                  <span>📅 {formatDate(request.created_at)}</span>
                  <span>•</span>
                  <span>🏷️ {request.service_type}</span>
                </p>
              </div>
              {getStatusBadge(request.status)}
            </div>

            <p className="request-description">{request.description}</p>

            <div className="quotes-section">
              <h4 className="quotes-title">
                Ofertas recibidas ({request.quotes.length})
              </h4>

              {request.quotes.length === 0 ? (
                <div className="no-quotes">
                  <span>⏳</span>
                  <p>You have not received any offers for this request yet</p>
                </div>
              ) : (
                <div className="quotes-grid">
                  {request.quotes.map((quote) => (
                    <div key={quote.id} className="quote-card">
                      <div className="quote-header-inner">
                        <div className="specialist-info">
                          <div className="specialist-avatar">
                            {quote.specialist_email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="specialist-email">{quote.specialist_email}</p>
                            <p className="quote-date">{formatDate(quote.created_at)}</p>
                          </div>
                        </div>
                        {getStatusBadge(quote.status)}
                      </div>

                      <div className="quote-details">
                        <div className="quote-detail-item">
                          <span className="detail-label">💰 Precio:</span>
                          <span className="detail-value price">{formatPrice(quote.price)}</span>
                        </div>
                        <div className="quote-detail-item">
                          <span className="detail-label">⏱️ Tiempo estimado:</span>
                          <span className="detail-value">{quote.estimated_time}</span>
                        </div>
                      </div>

                      <p className="quote-description">{quote.description}</p>

                      {quote.status === 'pending' && (
                        <div className="quote-actions">
                          <button className="btn-accept">Accept</button>
                          <button className="btn-reject">Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

