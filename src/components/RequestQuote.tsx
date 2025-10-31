import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAppSelector } from '../store/hooks'

export default function RequestQuote() {
  const { user } = useAppSelector((state) => state.auth)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: insertError } = await supabase
        .from('quote_requests')
        .insert({
          patient_id: user?.id,
          patient_email: user?.email,
          title,
          description,
          service_type: serviceType,
          status: 'open'
        })

      if (insertError) throw insertError

      setSuccess(true)
      setTitle('')
      setDescription('')
      setServiceType('')
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="request-quote-container">
      <div className="request-quote-header">
        <h2>Request Quote</h2>
        <p>Describe the service you need and receive offers from specialists</p>
      </div>

      <form onSubmit={handleSubmit} className="quote-form">
        <div className="form-group">
          <label htmlFor="title">
            <span className="label-text">Title</span>
            <span className="label-required">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Nutrition consultation"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="serviceType">
            <span className="label-text">Service Type</span>
            <span className="label-required">*</span>
          </label>
          <select
            id="serviceType"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select a type</option>
            <option value="consultation">Consulta</option>
            <option value="therapy">Therapy</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="treatment">Treatment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            <span className="label-text">Description</span>
            <span className="label-required">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the service you need..."
            required
            rows={5}
            className="form-input form-textarea"
          />
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅</span>
            <span>Request sent! The specialists will start sending offers.</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary btn-large"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
    </div>
  )
}

