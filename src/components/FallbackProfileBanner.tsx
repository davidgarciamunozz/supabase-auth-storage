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
    <div className="fallback-banner">
      <span className="fallback-banner-icon">⚠️</span>
      <div className="fallback-banner-content">
        <strong>Modo de Acceso Limitado</strong>
        <p>
          Could not load your complete profile. You are using a temporary role of 'paciente'.
          Reload the page to try to get your real profile.
        </p>
      </div>
      <button onClick={handleReload} className="fallback-banner-button">
        Reload Page
      </button>
    </div>
  )
}

