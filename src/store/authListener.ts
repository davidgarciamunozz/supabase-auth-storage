import { supabase } from "../lib/supabaseClient";
import { setSession } from "./auth/authSlice";
import type { AppDispatch } from "./store";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "../types/auth.types";

async function getSessionWithProfile(session: Session | null) {
    console.log('🔍 getSessionWithProfile llamado con session:', session ? 'existe' : 'null')
    
    if (!session) {
        console.log('⚠️ No hay sesión')
        return { session: null, profile: null }
    }

    console.log('🔍 Obteniendo perfil para user ID:', session.user.id)

    try {
        // Crear un timeout para evitar que se quede colgado
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout al obtener perfil')), 5000)
        })

        const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

        console.log('🔍 Esperando respuesta de Supabase...')
        
        const result = await Promise.race([
            profilePromise,
            timeoutPromise
        ])
        
        const { data: profile, error } = result as { 
            data: UserProfile | null; 
            error: { code?: string; message?: string; details?: string } | null 
        }
        
        console.log('🔍 Respuesta de Supabase - data:', profile, 'error:', error)
        
        if (error) {
            console.error('❌ Error obteniendo perfil:', error)
            if (error.code) console.error('❌ Error code:', error.code)
            if (error.message) console.error('❌ Error message:', error.message)
            console.warn('⚠️ Continuando sin perfil.')
            return { session, profile: null }
        }
        
        console.log('✅ Profile obtenido exitosamente:', profile)
        return { session, profile }
    } catch (error) {
        console.error('❌ Excepción al obtener perfil:', error)
        console.warn('⚠️ Continuando con sesión sin perfil')
        return { session, profile: null }
    }
}

export function startAuthListener(dispatch: AppDispatch) {
    supabase.auth.getSession().then(async ({ data }) => {
        console.log('📍 Auth Listener - Sesión inicial')
        const sessionData = await getSessionWithProfile(data.session)
        console.log('Session inicial con perfil:', sessionData)
        dispatch(setSession(sessionData))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('📍 Auth State Change - Evento:', event, 'Session:', session ? 'existe' : 'null')
        
        // Si es un evento de SIGNED_OUT, limpiar todo inmediatamente
        if (event === 'SIGNED_OUT') {
            console.log('🚪 Usuario cerró sesión, limpiando estado...')
            dispatch(setSession({ session: null, profile: null }))
            return
        }
        
        // Para otros eventos, obtener el perfil
        const sessionData = await getSessionWithProfile(session)
        console.log('Session actualizada con perfil:', sessionData)
        dispatch(setSession(sessionData))
    })

    return () => subscription.unsubscribe()
}