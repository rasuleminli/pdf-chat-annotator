import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type TAuthContext = {
    user: (User & { name?: string }) | null
    loading: boolean
}

const AuthContext = createContext<TAuthContext | null>(null)

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
    return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

    const value = useMemo(
        () => ({
            user: user
                ? { ...user, name: user.user_metadata?.display_name }
                : null,
            loading,
        }),
        [user, loading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
