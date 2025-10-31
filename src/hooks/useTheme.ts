import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Intentar obtener el tema del localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    // Si no hay tema guardado, usar el del sistema
    if (savedTheme) {
      return savedTheme
    }
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    // Actualizar el atributo data-theme en el html
    document.documentElement.setAttribute('data-theme', theme)
    // Guardar en localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return { theme, toggleTheme }
}

