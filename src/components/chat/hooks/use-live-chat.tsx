import { getUserDisplayName } from '@/features/auth/utils/get-user-display-name'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

/**
 * Live chat using Supabase Precence & Broadcast
 * https://supabase.com/docs/guides/realtime/presence
 */
export function useLiveChat(user: User | null) {
    const [onlineUsers, setOnlineUsers] = useState<
        { id: string; name: string }[]
    >([])

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel('pdf_room', {
            config: {
                presence: {
                    // The key that helps us identify the user in the presence state
                    key: user.id,
                },
            },
        })

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState()
                const uniqueUsers = Object.entries(newState).map(
                    ([id, presences]) => {
                        // 'presences' is an array of sessions for this specific ID
                        // We take the metadata from the first active session
                        const p = presences[0] as {
                            name: string
                            presence_ref: string
                        }
                        return {
                            id: id,
                            name: p.name || 'Anonymous',
                        }
                    }
                )
                setOnlineUsers(uniqueUsers)
            })
            // For our goal of just listing online users, we don't need to listen to join and leave events,
            // because the sync event already acts as the single source of truth for the current online users.
            // .on('presence', { event: 'join' }, ({ key, newPresences }) => {})
            // .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {})
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ name: getUserDisplayName(user) })
                }
            })

        return () => {
            channel.unsubscribe()
        }
    }, [user])

    return { onlineUsers }
}
