import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function Login() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { session, loading, error } = useAppSelector((state) => state.auth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [validationError, setValidationError] = useState<string | null>(null)

    useEffect(() => {
        if (session) {
            navigate('/home', { replace: true })
        }
    }, [session, navigate])

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!email || !password) {
            setValidationError('Completa tu email y contraseña')
            return
        }

        setValidationError(null)
        dispatch(signIn({ email, password }))
    }

    const showError = validationError ?? error

    return (
        <section className="auth-view">
            <h1>Iniciar sesión</h1>
            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    Correo electrónico
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        required
                    />
                </label>
                <label>
                    Contraseña
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                    />
                </label>
                {showError && <p className="form-error">{showError}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando…' : 'Entrar'}
                </button>
            </form>
            <p>
                ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
            </p>
        </section>
    )
}
