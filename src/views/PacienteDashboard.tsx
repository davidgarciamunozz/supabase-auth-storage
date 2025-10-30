import { signOut } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function PacienteDashboard() {
    const dispatch = useAppDispatch()
    const { user, loading } = useAppSelector((state) => state.auth)

    const handleSignOut = () => {
        dispatch(signOut())
    }

    return (
        <section className="dashboard-view">
            <h1>Patient Panel</h1>
            {user && <p className="user-info">Bienvenido, {user.email}</p>}
            
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h2>Request for a quote</h2>
                    <p>Request a quote for a service.</p>
                    <button>Request</button>
                </div>
                
                <div className="dashboard-card">
                    <h2></h2>
                    <p>Accede a tu historial médico completo.</p>
                    <button>Ver Historial</button>
                </div>
            </div>
            
            <button onClick={handleSignOut} disabled={loading} className="logout-button">
                {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
        </section>
    )
}

