import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export default function Home() {
    const navigate = useNavigate()
    const { role, initialized, user, profile } = useAppSelector((state) => state.auth)

    useEffect(() => {
        console.log('Estado de autenticación:', { user, role, profile, initialized })
        
        // Si no hay usuario, no hacer nada
        if (!user) {
            console.log('⚠️ No hay usuario, permaneciendo en Home')
            return
        }
        
        if (initialized && role) {
            // Redirigir según el rol del usuario
            console.log('✅ Usuario con rol detectado:', role)
            switch (role) {
                case 'admin':
                    navigate('/admin', { replace: true })
                    break
                case 'paciente':
                case 'patient': // Soporte para rol en inglés
                    navigate('/paciente', { replace: true })
                    break
                case 'especialista':
                case 'specialist': // Soporte para rol en inglés
                    navigate('/especialista', { replace: true })
                    break
                default:
                    console.log('Rol no reconocido:', role)
                    break
            }
        } else if (initialized && !role && user) {
            console.warn('Usuario autenticado pero sin rol asignado')
        }
    }, [role, initialized, navigate, user, profile])

    return (
        <section className="home-view">
            <h1>Cargando...</h1>
            <p>Redirigiendo a tu panel...</p>
            {initialized && !role && (
                <div style={{ marginTop: '2rem', color: 'red' }}>
                    <p>⚠️ Tu cuenta no tiene un rol asignado</p>
                    <p>Por favor contacta al administrador</p>
                </div>
            )}
        </section>
    )
}
