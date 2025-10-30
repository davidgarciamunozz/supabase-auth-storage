import { useAppSelector } from '../store/hooks'
import type { UserRole } from '../types/auth.types'
import { isAdmin, isPaciente, isEspecialista } from '../types/auth.types'

/**
 * Hook personalizado para acceder y verificar roles de usuario
 */
export function useUserRole() {
  const { role, profile, user, loading, initialized } = useAppSelector((state) => state.auth)

  return {
    // Información del usuario
    role,
    profile,
    user,
    loading,
    initialized,

    // Verificaciones de roles
    isAdmin: isAdmin(role),
    isPaciente: isPaciente(role),
    isEspecialista: isEspecialista(role),

    // Verificar si el usuario tiene uno de los roles especificados
    hasRole: (allowedRoles: UserRole[]) => {
      return role ? allowedRoles.includes(role) : false
    },

    // Verificar si el usuario tiene exactamente un rol específico
    hasExactRole: (requiredRole: UserRole) => {
      return role === requiredRole
    }
  }
}

