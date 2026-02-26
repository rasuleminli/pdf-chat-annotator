import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fires immediately with the current session, then on every auth change
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })
        return () => subscription.unsubscribe()
    }, [])

    return { user, loading }
}
