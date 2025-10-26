import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";


type AuthState = {
    session: Session | null
    user: Session['user'] | null
    loading: boolean
    error: string | null
    initialized: boolean
}

const initialState:AuthState = {session: null, user:null, loading:false, error:null, initialized:false}

export const fetchSession = createAsyncThunk('auth/fetchSession', async() => {
    const {data, error} = await supabase.auth.getSession()
    if (error) throw error
    return data.session
})

export const signIn = createAsyncThunk('auth/signIn',async({email,password}:{email:string, password:string}) => {
    const {error, data} = await supabase.auth.signInWithPassword({email,password})
    if(error) throw error
    return data.session
})

export const signUp = createAsyncThunk('auth/signUp', async({email, password}:{email:string, password:string}) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if(error) throw error
    return data.session
})

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
            state.session = action.payload
            state.user = action.payload?.user ?? null
            state.initialized = true
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
                state.session = action.payload
                state.user = action.payload?.user ?? null
                state.initialized = true
            })
            .addCase(fetchSession.rejected, setRejected)
            .addCase(signIn.pending, setPending)
            .addCase(signIn.fulfilled, (state, action) => {
                state.loading = false
                state.session = action.payload
                state.user = action.payload?.user ?? null
                state.initialized = true
            })

            .addCase(signIn.rejected, setRejected)
            .addCase(signUp.pending, setPending)
            .addCase(signUp.fulfilled, (state, action) => {
                state.loading = false
                state.session = action.payload
                state.user = action.payload?.user ?? null
                state.initialized = true
            })
            .addCase(signUp.rejected, setRejected)
            .addCase(signOut.pending, setPending)
            .addCase(signOut.fulfilled, (state) => {
                state.loading = false
                state.session = null
                state.user = null
                state.initialized = true
            })

            .addCase(signOut.rejected, setRejected)
    }
})

export const {setSession} = authSlice.actions
export default authSlice.reducer
