import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import NavLayout from '../layout/NavLayout'
import type { UserRole } from '../types/auth.types'

export default function Register() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { session, loading, error } = useAppSelector((state) => state.auth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState<UserRole>('patient')
    const [feedback, setFeedback] = useState<string | null>(null)
    const [validationError, setValidationError] = useState<string | null>(null)

    useEffect(() => {
        console.log('🔍 Register useEffect - session:', session ? 'existe' : 'null')
        // Solo redirigir si hay sesión
        if (session) {
            console.log('🟢 Sesión detectada en registro, redirigiendo a /home')
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
            const sessionResponse = await dispatch(signUp({ email, password, role })).unwrap()

            if (!sessionResponse?.session) {
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
       <NavLayout>
         <section className="auth-view flex flex-col gap-4">
            <h1>Crear cuenta</h1>
            <form onSubmit={handleSubmit} className="auth-form">
                <label className='flex flex-col gap-2 text-left'>
                    Correo electrónico
                <input
                        className='border border-gray-300 rounded-md p-2'
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        required
                    />
                </label>
                <label className='flex flex-col gap-2 text-left'>
                    Contraseña
                    <input
                        className='border border-gray-300 rounded-md p-2'
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </label>
                <label className='flex flex-col gap-2 text-left'>
                    Confirmar contraseña
                    <input
                        className='border border-gray-300 rounded-md p-2'
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </label>
                <label className='flex flex-col gap-2 text-left'>
                    Tipo de cuenta
                    <select
                        className='border border-gray-300 rounded-md p-2'
                        value={role}
                        onChange={(event) => setRole(event.target.value as UserRole)}
                        required
                    >
                        <option value="patient">Paciente</option>
                        <option value="specialist">Especialista</option>
                        <option value="admin">Administrador</option>
                    </select>
                </label>
                {showError && <p className="form-error">{showError}</p>}
                {feedback && <p className="form-info">{feedback}</p>}
                <button className='w-full mt-4' type="submit" disabled={loading}>
                    {loading ? 'Cargando…' : 'Registrarme'}
                </button>
            </form>
            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </section>
       </NavLayout>
    )
}
