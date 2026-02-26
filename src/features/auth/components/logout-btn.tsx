import { Button, type ButtonProps } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export function LogoutBtn(props: ButtonProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Logout failed:', error.message)
                setIsLoggingOut(false)
            }
            // Auth listener will take it from here (see `use-auth.ts`)
        } catch (error) {
            console.error(
                'Logout failed:',
                error instanceof Error ? error.message : 'Unknown error'
            )
            setIsLoggingOut(false)
        }
    }
    return (
        <Button {...props} onClick={handleLogout} disabled={isLoggingOut}>
            Logout
        </Button>
    )
}
