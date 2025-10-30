import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import type { UserProfile, UserRole } from "../../types/auth.types";


type AuthState = {
    session: Session | null
    user: Session['user'] | null
    profile: UserProfile | null
    role: UserRole | null
    loading: boolean
    error: string | null
    initialized: boolean
    isUsingFallbackProfile: boolean
}

const initialState:AuthState = {
    session: null, 
    user: null, 
    profile: null,
    role: null,
    loading: false, 
    error: null, 
    initialized: false,
    isUsingFallbackProfile: false
}

export const fetchSession = createAsyncThunk('auth/fetchSession', async() => {
    const {data, error} = await supabase.auth.getSession()
    if (error) throw error
    
    // Crear perfil desde user_metadata (sin consultar DB)
    let profile = null
    if (data.session?.user) {
        profile = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            role: data.session.user.user_metadata?.role || 'paciente',
            created_at: data.session.user.created_at,
            updated_at: data.session.user.updated_at || new Date().toISOString()
        }
    }
    
    return { session: data.session, profile }
})

export const signIn = createAsyncThunk('auth/signIn',async({email,password}:{email:string, password:string}) => {
    const {error, data} = await supabase.auth.signInWithPassword({email,password})
    if(error) throw error
    
    // Crear perfil desde user_metadata (sin consultar DB)
    let profile = null
    if (data.session?.user) {
        profile = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            role: data.session.user.user_metadata?.role || 'paciente',
            created_at: data.session.user.created_at,
            updated_at: data.session.user.updated_at || new Date().toISOString()
        }
    }
    
    return { session: data.session, profile }
})

export const signUp = createAsyncThunk(
    'auth/signUp', 
    async({email, password, role = 'paciente'}:{email:string, password:string, role?: UserRole}) => {
        // OPCIÓN SIMPLIFICADA: Usar user_metadata en lugar de tabla profiles
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role, // Guardar rol directamente en el usuario
                    created_at: new Date().toISOString()
                }
            }
        })
        if(error) throw error
        
        // Crear perfil "virtual" desde metadata
        let profile = null
        if (data.user) {
            profile = {
                id: data.user.id,
                email: data.user.email || '',
                role: data.user.user_metadata?.role || 'paciente',
                created_at: data.user.created_at,
                updated_at: data.user.updated_at || new Date().toISOString()
            }
        }
        
        return { session: data.session, profile }
    }
)

export const signOut = createAsyncThunk('auth/signOut', async() => {
    const {error} = await supabase.auth.signOut()
    if(error) throw error
    return null
})

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers: {
        setSession(state, action) {
            console.log('📦 setSession llamado con:', action.payload)
            
            // Si el payload es null o no tiene session, limpiar todo
            if (!action.payload || !action.payload.session) {
                console.log('🧹 Limpiando estado de autenticación')
                state.session = null
                state.user = null
                state.profile = null
                state.role = null
                state.initialized = true
                state.error = null
                state.isUsingFallbackProfile = false
                return
            }
            
            // Si hay sesión, actualizar el estado
            state.session = action.payload.session
            state.user = action.payload.session?.user ?? null
            state.profile = action.payload.profile ?? null
            state.role = action.payload.profile?.role ?? null
            state.isUsingFallbackProfile = action.payload.isFallback ?? false
            state.initialized = true
            
            console.log('📦 Estado actualizado:', {
                hasSession: !!state.session,
                hasUser: !!state.user,
                hasProfile: !!state.profile,
                role: state.role,
                isFallback: state.isUsingFallbackProfile
            })
        }
    },
    extraReducers: (builder) => {
        const setPending = (state: AuthState) => {
            state.loading = true
            state.error = null
        }
        const setRejected = (state: AuthState, action: { error?: { message?: string } }) => {
            state.loading = false
            state.error = action.error?.message ?? 'Error de autenticación'
            state.initialized = true
        }


        builder
            .addCase(fetchSession.pending, setPending)
            .addCase(fetchSession.fulfilled, (state, action) => {
                state.loading = false
                state.session = action.payload.session
                state.user = action.payload.session?.user ?? null
                state.profile = action.payload.profile
                state.role = action.payload.profile?.role ?? null
                state.initialized = true
            })
            .addCase(fetchSession.rejected, setRejected)
            .addCase(signIn.pending, setPending)
            .addCase(signIn.fulfilled, (state, action) => {
                state.loading = false
                state.session = action.payload.session
                state.user = action.payload.session?.user ?? null
                state.profile = action.payload.profile
                state.role = action.payload.profile?.role ?? null
                state.initialized = true
            })

            .addCase(signIn.rejected, setRejected)
            .addCase(signUp.pending, setPending)
            .addCase(signUp.fulfilled, (state, action) => {
                state.loading = false
                state.session = action.payload.session
                state.user = action.payload.session?.user ?? null
                state.profile = action.payload.profile
                state.role = action.payload.profile?.role ?? null
                state.initialized = true
            })
            .addCase(signUp.rejected, setRejected)
            .addCase(signOut.pending, setPending)
            .addCase(signOut.fulfilled, (state) => {
                console.log('✅ SignOut fulfilled - Limpiando estado')
                state.loading = false
                state.session = null
                state.user = null
                state.profile = null
                state.role = null
                state.error = null
                state.initialized = true
            })

            .addCase(signOut.rejected, setRejected)
    }
})

export const {setSession} = authSlice.actions
export default authSlice.reducer
