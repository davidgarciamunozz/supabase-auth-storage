import { signOut } from '../store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function EspecialistaDashboard() {
    const dispatch = useAppDispatch()
    const { user, loading } = useAppSelector((state) => state.auth)

    const handleSignOut = () => {
        dispatch(signOut())
    }

    return (
        <section className="dashboard-view">
            <h1>👨‍⚕️ Panel de Especialista</h1>
            {user && <p className="user-info">Sesión iniciada como {user.email}</p>}
            
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h2>Mis Pacientes</h2>
                    <p>Lista de pacientes asignados.</p>
                    <button>Ver Pacientes</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Agenda</h2>
                    <p>Gestiona tu calendario de citas.</p>
                    <button>Ver Agenda</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Consultas Pendientes</h2>
                    <p>Consultas que requieren atención.</p>
                    <button>Ver Consultas</button>
                </div>
                
                <div className="dashboard-card">
                    <h2>Emitir Receta</h2>
                    <p>Crear y enviar recetas médicas.</p>
                    <button>Nueva Receta</button>
                </div>
            </div>
            
            <button onClick={handleSignOut} disabled={loading} className="logout-button">
                {loading ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
        </section>
    )
}

