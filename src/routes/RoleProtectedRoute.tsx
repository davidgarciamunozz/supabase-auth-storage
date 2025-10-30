import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import type { UserRole } from '../types/auth.types'

type RoleProtectedRouteProps = {
    children: ReactElement
    allowedRoles: UserRole[]
}

// Función para verificar si el rol del usuario coincide con los permitidos
function hasAccess(userRole: UserRole | null, allowedRoles: UserRole[]): boolean {
    if (!userRole) return false
    
    // Mapeo de roles para soporte de español e inglés
    const roleMap: Record<string, string[]> = {
        'admin': ['admin'],
        'paciente': ['paciente', 'patient'],
        'patient': ['paciente', 'patient'],
        'especialista': ['especialista', 'specialist'],
        'specialist': ['especialista', 'specialist']
    }
    
    // Obtener todos los roles equivalentes del usuario
    const userEquivalentRoles = roleMap[userRole] || [userRole]
    
    // Verificar si alguno de los roles equivalentes está en los roles permitidos
    return allowedRoles.some(allowedRole => {
        const allowedEquivalentRoles = roleMap[allowedRole] || [allowedRole]
        return userEquivalentRoles.some(userEquivRole => 
            allowedEquivalentRoles.includes(userEquivRole)
        )
    })
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
    const { session, role, profile, initialized } = useAppSelector((state) => state.auth)
    const location = useLocation()

    // Mientras se inicializa, mostrar loading
    if (!initialized) {
        return <div className="route-loading">Verificando sesión…</div>
    }

    // Si no hay sesión, redirigir al login
    if (!session) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    // Si hay sesión pero aún no se ha cargado el perfil, mostrar loading
    // Esto evita el flash de "No autorizado" mientras se obtiene el perfil
    if (session && !profile) {
        return <div className="route-loading">Cargando perfil de usuario…</div>
    }

    // Ya tenemos sesión y perfil, verificar permisos
    if (!hasAccess(role, allowedRoles)) {
        return (
            <div className="unauthorized-view">
                <h1>Acceso No Autorizado</h1>
                <p>No tienes permisos para acceder a esta página.</p>
                <p>Tu rol actual es: <strong>{role || 'sin rol'}</strong></p>
                <a href="/home">Volver al inicio</a>
            </div>
        )
    }

    return children
}

