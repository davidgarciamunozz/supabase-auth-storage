import { supabase } from "../lib/supabaseClient";
import { setSession } from "./auth/authSlice";
import type { AppDispatch } from "./store";




export function startAuthListener(dispatch:AppDispatch) {
    supabase.auth.getSession().then(({data})=> {
        dispatch(setSession(data.session))
    })

    const {data:{subscription},} = supabase.auth.onAuthStateChange((_event, session) =>{
        dispatch(setSession(session))
    })

    return() => subscription.unsubscribe()
}