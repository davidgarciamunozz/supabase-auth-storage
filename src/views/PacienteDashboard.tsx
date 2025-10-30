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
            <h1>🏥 Panel de Paciente</h1>
            {user && <p className="user-info">Bienvenido, {user.email}</p>}
            
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h2>Mis Citas</h2>
                    <p>Consulta y gestiona tus citas médicas.</p>
                    <button>Ver Citas</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Historial Médico</h2>
                    <p>Accede a tu historial médico completo.</p>
                    <button>Ver Historial</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Agendar Cita</h2>
                    <p>Agenda una nueva cita con un especialista.</p>
                    <button>Agendar</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Recetas</h2>
                    <p>Consulta tus recetas médicas.</p>
                    <button>Ver Recetas</button>
                </div>
            </div>
            
            <button onClick={handleSignOut} disabled={loading} className="logout-button">
                {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
        </section>
    )
}

