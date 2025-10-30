import { setSession } from "./auth/authSlice";
import { supabase } from "../lib/supabaseClient";
import type { AppDispatch } from "./store";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "../types/auth.types";

async function getSessionWithProfile(session: Session | null) {
    console.log('🔍 getSessionWithProfile llamado con session:', session ? 'existe' : 'null')
    
    if (!session) {
        console.log('⚠️ No hay sesión')
        return { session: null, profile: null, isFallback: false }
    }

    console.log('🔍 Creando perfil desde user_metadata para user ID:', session.user.id)

    // VERSIÓN SIMPLIFICADA: Crear perfil desde user_metadata (sin consultar DB)
    try {
        const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'paciente',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || new Date().toISOString()
        }
        
        console.log('✅ Perfil creado desde metadata:', profile)
        return { session, profile, isFallback: false }
    } catch (error) {
        console.error('❌ Error creando perfil desde metadata:', error)
        return createFallbackProfile(session)
    }
}

// Crear un perfil por defecto cuando no se puede obtener de la DB
function createFallbackProfile(session: Session) {
    console.log('🔧 Creando perfil de respaldo para usuario:', session.user.id)
    
    const fallbackProfile: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        role: 'paciente', // Rol por defecto más restrictivo
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
    
    console.log('✅ Perfil de respaldo creado:', fallbackProfile)
    return { session, profile: fallbackProfile, isFallback: true }
}

export function startAuthListener(dispatch: AppDispatch) {
    // Variable para cachear el perfil del usuario y si es fallback
    let cachedProfile: UserProfile | null = null
    let cachedIsFallback = false
    let isInitializing = true // Flag para evitar eventos duplicados durante inicialización

    // Cargar sesión inicial
    supabase.auth.getSession().then(async ({ data }) => {
        console.log('📍 Auth Listener - Sesión inicial')
        const sessionData = await getSessionWithProfile(data.session)
        console.log('Session inicial con perfil:', sessionData)
        cachedProfile = sessionData.profile // Guardar perfil en cache
        cachedIsFallback = sessionData.isFallback // Guardar flag en cache
        dispatch(setSession(sessionData))
        isInitializing = false // Marcar inicialización como completa
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('📍 Auth State Change - Evento:', event, 'Session:', session ? 'existe' : 'null')
        
        // Ignorar eventos durante la inicialización inicial para evitar duplicados
        if (isInitializing && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
            console.log('⏭️ Ignorando evento durante inicialización:', event)
            return
        }
        
        // Si es un evento de SIGNED_OUT, limpiar todo inmediatamente
        if (event === 'SIGNED_OUT') {
            console.log('🚪 Usuario cerró sesión, limpiando estado...')
            cachedProfile = null // Limpiar cache
            cachedIsFallback = false
            dispatch(setSession({ session: null, profile: null, isFallback: false }))
            return
        }
        
        // Para TOKEN_REFRESHED, solo actualizar la sesión pero mantener el perfil en cache
        if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refrescado, manteniendo perfil en cache')
            dispatch(setSession({ session, profile: cachedProfile, isFallback: cachedIsFallback }))
            return
        }
        
        // Para INITIAL_SESSION (después de la inicialización), usar cache
        if (event === 'INITIAL_SESSION') {
            console.log('📝 INITIAL_SESSION, usando perfil en cache')
            dispatch(setSession({ session, profile: cachedProfile, isFallback: cachedIsFallback }))
            return
        }
        
        // Para SIGNED_IN y otros eventos importantes, obtener el perfil nuevamente
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            console.log('🔐 Evento de autenticación importante, obteniendo perfil...')
            const sessionData = await getSessionWithProfile(session)
            console.log('Session actualizada con perfil:', sessionData)
            cachedProfile = sessionData.profile // Actualizar cache
            cachedIsFallback = sessionData.isFallback // Actualizar flag
            dispatch(setSession(sessionData))
            return
        }
        
        // Para cualquier otro evento, usar el perfil en cache si existe
        console.log('📝 Otro evento, usando perfil en cache')
        dispatch(setSession({ session, profile: cachedProfile, isFallback: cachedIsFallback }))
    })

    return () => subscription.unsubscribe()
}