import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

type ProtectedRouteProps = {
    children: ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { session, initialized } = useAppSelector((state) => state.auth)
    const location = useLocation()

    if (!initialized) {
        return <div className="route-loading">Verificando sesión…</div>
    }

    if (!session) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return children
}
