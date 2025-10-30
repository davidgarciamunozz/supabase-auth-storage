import { useAppSelector } from '../store/hooks'

/**
 * Banner que muestra una advertencia cuando el usuario está usando un perfil de respaldo
 * debido a problemas de conectividad con la base de datos
 */
export default function FallbackProfileBanner() {
  const { isUsingFallbackProfile } = useAppSelector((state) => state.auth)

  if (!isUsingFallbackProfile) {
    return null
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div style={{
      backgroundColor: '#fff3cd',
      borderBottom: '2px solid #ffc107',
      padding: '12px 20px',
      textAlign: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px'
    }}>
      <span style={{ fontSize: '20px' }}>⚠️</span>
      <div style={{ flex: 1, maxWidth: '800px' }}>
        <strong>Modo de Acceso Limitado</strong>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
          No se pudo cargar tu perfil completo. Estás usando un rol temporal de 'paciente'.
          Recarga la página para intentar obtener tu perfil real.
        </p>
      </div>
      <button
        onClick={handleReload}
        style={{
          backgroundColor: '#ffc107',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        Recargar Página
      </button>
    </div>
  )
}

