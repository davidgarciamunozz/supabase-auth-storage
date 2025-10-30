// Tipos de roles de usuario (soporte para español e inglés)
export type UserRole = 'admin' | 'paciente' | 'especialista' | 'patient' | 'specialist'

// Interfaz del perfil de usuario
export interface UserProfile {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

// Utilidad para verificar roles
export const isAdmin = (role: UserRole | null | undefined): boolean => role === 'admin'
export const isPaciente = (role: UserRole | null | undefined): boolean => role === 'paciente' || role === 'patient'
export const isEspecialista = (role: UserRole | null | undefined): boolean => role === 'especialista' || role === 'specialist'

