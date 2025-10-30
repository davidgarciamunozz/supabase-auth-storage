import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

type ProtectedRouteProps = {
    children: ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { session, profile, initialized } = useAppSelector((state) => state.auth)
    const location = useLocation()

    if (!initialized) {
        return <div className="route-loading">Verificando sesión…</div>
    }

    if (!session) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    // Si hay sesión pero aún no se ha cargado el perfil, mostrar loading
    if (session && !profile) {
        return <div className="route-loading">Cargando perfil de usuario…</div>
    }

    return children
}
