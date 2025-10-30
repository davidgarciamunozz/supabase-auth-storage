import type { ReactNode } from 'react'
import { useUserRole } from '../hooks/useUserRole'
import type { UserRole } from '../types/auth.types'

type RoleBasedContentProps = {
  allowedRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente para mostrar contenido condicionalmente basado en roles
 * 
 * Ejemplo de uso:
 * <RoleBasedContent allowedRoles={['admin', 'especialista']}>
 *   <p>Solo admins y especialistas pueden ver esto</p>
 * </RoleBasedContent>
 */
export default function RoleBasedContent({ allowedRoles, children, fallback = null }: RoleBasedContentProps) {
  const { hasRole } = useUserRole()

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

