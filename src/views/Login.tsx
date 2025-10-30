import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import NavLayout from '../layout/NavLayout'

export default function Login() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { session, loading, error } = useAppSelector((state) => state.auth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [validationError, setValidationError] = useState<string | null>(null)

    useEffect(() => {
        console.log('🔍 Login useEffect - session:', session ? 'existe' : 'null', 'loading:', loading)
        // Solo redirigir si hay sesión Y el estado está inicializado
        if (session) {
            console.log('🟢 Sesión detectada, redirigiendo a /home')
            navigate('/home', { replace: true })
        }
    }, [session, navigate])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!email || !password) {
            setValidationError('Completa tu email y contraseña')
            return
        }

        setValidationError(null)
        console.log('🔵 Iniciando login...')
        try {
            const result = await dispatch(signIn({ email, password })).unwrap()
            console.log('🔵 Login completado:', result)
        } catch (error) {
            console.error('🔴 Error en login:', error)
        }
    }

    const showError = validationError ?? error

    return (
        <NavLayout>
            <section className="auth-view flex flex-col gap-4">
            <h1>Iniciar sesión</h1>
            <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-4">
                    <input
                        className='border border-gray-300 rounded-md p-2'
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        required
                    />
                    <input
                        className='border border-gray-300 rounded-md p-2'
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                    />
                {showError && <p className="form-error">{showError}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando…' : 'Entrar'}
                </button>
            </form>
            <p>
                ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
            </p>
        </section>
        </NavLayout>
    )
}
