import { signOut } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function Home() {
    const dispatch = useAppDispatch()
    const { user, loading, error } = useAppSelector((state) => state.auth)

    const handleSignOut = () => {
        dispatch(signOut())
    }

    return (
        <section className="home-view">
            <h1>Bienvenido</h1>
            {user && <p>Sesión iniciada como {user.email}</p>}
            {error && <p className="form-error">{error}</p>}
            <button onClick={handleSignOut} disabled={loading}>
                {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
        </section>
    )
}
