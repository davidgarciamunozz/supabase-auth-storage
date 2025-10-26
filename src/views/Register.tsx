import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function Register() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { session, loading, error } = useAppSelector((state) => state.auth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [feedback, setFeedback] = useState<string | null>(null)
    const [validationError, setValidationError] = useState<string | null>(null)

    useEffect(() => {
        if (session) {
            navigate('/home', { replace: true })
        }
    }, [session, navigate])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!email || !password || !confirmPassword) {
            setValidationError('Completa todos los campos')
            return
        }

        if (password !== confirmPassword) {
            setValidationError('Las contraseñas no coinciden')
            return
        }

        setValidationError(null)
        setFeedback(null)

        try {
            const sessionResponse = await dispatch(signUp({ email, password })).unwrap()

            if (!sessionResponse) {
                setFeedback('Revisa tu correo para confirmar la cuenta antes de iniciar sesión')
            } else {
                navigate('/home', { replace: true })
            }
        } catch (signUpError) {
            const message = signUpError instanceof Error ? signUpError.message : 'No se pudo crear la cuenta'
            setValidationError(message)
        }
    }

    const showError = validationError ?? error

    return (
        <section className="auth-view">
            <h1>Crear cuenta</h1>
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
                        autoComplete="new-password"
                        required
                    />
                </label>
                <label>
                    Confirmar contraseña
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </label>
                {showError && <p className="form-error">{showError}</p>}
                {feedback && <p className="form-info">{feedback}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando…' : 'Registrarme'}
                </button>
            </form>
            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </section>
    )
}
