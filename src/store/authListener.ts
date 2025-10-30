import { supabase } from "../lib/supabaseClient";
import { setSession } from "./auth/authSlice";
import type { AppDispatch } from "./store";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "../types/auth.types";

async function getSessionWithProfile(session: Session | null, retries = 2) {
    console.log('🔍 getSessionWithProfile llamado con session:', session ? 'existe' : 'null')
    
    if (!session) {
        console.log('⚠️ No hay sesión')
        return { session: null, profile: null }
    }

    console.log('🔍 Obteniendo perfil para user ID:', session.user.id)

    // Intentar obtener el perfil con reintentos
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔍 Intento ${attempt}/${retries} - Consultando Supabase...`)
            
            // Timeout más largo (15 segundos)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout al obtener perfil')), 15000)
            })

            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
            
            const result = await Promise.race([
                profilePromise,
                timeoutPromise
            ])
            
            const { data: profile, error } = result as { 
                data: UserProfile | null; 
                error: { code?: string; message?: string; details?: string } | null 
            }
            
            if (error) {
                console.error('❌ Error obteniendo perfil:', error)
                if (attempt < retries) {
                    console.log('🔄 Reintentando...')
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1s antes de reintentar
                    continue
                }
                console.warn('⚠️ Todos los reintentos fallaron, continuando sin perfil.')
                return { session, profile: null }
            }
            
            console.log('✅ Profile obtenido exitosamente:', profile)
            return { session, profile }
            
        } catch (error) {
            console.error(`❌ Excepción en intento ${attempt}:`, error)
            if (attempt < retries) {
                console.log('🔄 Reintentando...')
                await new Promise(resolve => setTimeout(resolve, 1000))
                continue
            }
            console.warn('⚠️ Todos los reintentos fallaron, continuando con sesión sin perfil')
            return { session, profile: null }
        }
    }
    
    return { session, profile: null }
}

export function startAuthListener(dispatch: AppDispatch) {
    // Variable para cachear el perfil del usuario
    let cachedProfile: UserProfile | null = null
    let isInitializing = true // Flag para evitar eventos duplicados durante inicialización

    // Cargar sesión inicial
    supabase.auth.getSession().then(async ({ data }) => {
        console.log('📍 Auth Listener - Sesión inicial')
        const sessionData = await getSessionWithProfile(data.session)
        console.log('Session inicial con perfil:', sessionData)
        cachedProfile = sessionData.profile // Guardar perfil en cache
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
            dispatch(setSession({ session: null, profile: null }))
            return
        }
        
        // Para TOKEN_REFRESHED, solo actualizar la sesión pero mantener el perfil en cache
        if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refrescado, manteniendo perfil en cache')
            dispatch(setSession({ session, profile: cachedProfile }))
            return
        }
        
        // Para INITIAL_SESSION (después de la inicialización), usar cache
        if (event === 'INITIAL_SESSION') {
            console.log('📝 INITIAL_SESSION, usando perfil en cache')
            dispatch(setSession({ session, profile: cachedProfile }))
            return
        }
        
        // Para SIGNED_IN y otros eventos importantes, obtener el perfil nuevamente
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            console.log('🔐 Evento de autenticación importante, obteniendo perfil...')
            const sessionData = await getSessionWithProfile(session)
            console.log('Session actualizada con perfil:', sessionData)
            cachedProfile = sessionData.profile // Actualizar cache
            dispatch(setSession(sessionData))
            return
        }
        
        // Para cualquier otro evento, usar el perfil en cache si existe
        console.log('📝 Otro evento, usando perfil en cache')
        dispatch(setSession({ session, profile: cachedProfile }))
    })

    return () => subscription.unsubscribe()
}