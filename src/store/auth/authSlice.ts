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
}

const initialState:AuthState = {
    session: null, 
    user: null, 
    profile: null,
    role: null,
    loading: false, 
    error: null, 
    initialized: false
}

export const fetchSession = createAsyncThunk('auth/fetchSession', async() => {
    const {data, error} = await supabase.auth.getSession()
    if (error) throw error
    
    let profile = null
    if (data.session?.user) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
        profile = profileData
    }
    
    return { session: data.session, profile }
})

export const signIn = createAsyncThunk('auth/signIn',async({email,password}:{email:string, password:string}) => {
    const {error, data} = await supabase.auth.signInWithPassword({email,password})
    if(error) throw error
    
    let profile = null
    if (data.session?.user) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
        profile = profileData
    }
    
    return { session: data.session, profile }
})

export const signUp = createAsyncThunk(
    'auth/signUp', 
    async({email, password, role = 'paciente'}:{email:string, password:string, role?: UserRole}) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if(error) throw error
        
        let profile = null
        if (data.user) {
            // Actualizar el rol del perfil que se creó automáticamente
            const { data: profileData } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', data.user.id)
                .select()
                .single()
            profile = profileData
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
                return
            }
            
            // Si hay sesión, actualizar el estado
            state.session = action.payload.session
            state.user = action.payload.session?.user ?? null
            state.profile = action.payload.profile ?? null
            state.role = action.payload.profile?.role ?? null
            state.initialized = true
            
            console.log('📦 Estado actualizado:', {
                hasSession: !!state.session,
                hasUser: !!state.user,
                hasProfile: !!state.profile,
                role: state.role
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
