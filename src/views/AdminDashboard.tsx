import { signOut } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function AdminDashboard() {
    const dispatch = useAppDispatch()
    const { user, loading } = useAppSelector((state) => state.auth)

    const handleSignOut = () => {
        dispatch(signOut())
    }

    return (
        <section className="dashboard-view">
            <h1>🛡️ Panel de Administrador</h1>
            {user && <p className="user-info">Sesión iniciada como {user.email}</p>}
            
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h2>Gestión de Usuarios</h2>
                    <p>Aquí puedes administrar todos los usuarios del sistema.</p>
                    <button>Ver Usuarios</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Estadísticas</h2>
                    <p>Panel de estadísticas y métricas del sistema.</p>
                    <button>Ver Estadísticas</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Configuración</h2>
                    <p>Configuración general del sistema.</p>
                    <button>Configurar</button>
                </div>
            </div>
            
            <button onClick={handleSignOut} disabled={loading} className="logout-button">
                {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
        </section>
    )
}

