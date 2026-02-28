import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useAuthContext } from '../../auth/providers/auth-provider'
import type { HighlightReference } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type OnlineUser = { id: string; name: string }
type Message = {
    id: string
    user: { name: string; id: string }
    text: string
    timestamp: number
    highlightRef?: HighlightReference
}

type TChatContext = {
    onlineUsers: OnlineUser[]
    messages: Message[]
    sendMessage: (
        content: string,
        highlightRef?: HighlightReference
    ) => Promise<void>
}

const ChatContext = createContext<TChatContext | null>(null)

export function useChatContext() {
    const ctx = useContext(ChatContext)
    if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
    return ctx
}

const CHANNEL_NAME = 'chat_room'
const CHAT_MESSAGE_EVENT = 'chat_msg'

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthContext()

    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
    const [messages, setMessages] = useState<Message[]>([])

    const channelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel(CHANNEL_NAME, {
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
            .on('broadcast', { event: CHAT_MESSAGE_EVENT }, (payload) => {
                setMessages((prev) => [...prev, payload.payload])
            })
            // For our goal of just listing online users, we don't need to listen to join and leave events,
            // because the sync event already acts as the single source of truth for the current online users.
            // .on('presence', { event: 'join' }, ({ key, newPresences }) => {})
            // .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {})
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ name: user.name })
                    channelRef.current = channel
                } else {
                    channelRef.current = null
                }
            })

        return () => {
            channel?.unsubscribe()
            channelRef.current = null
        }
    }, [user])

    const sendMessage = useCallback(
        async (content: string, highlightRef?: HighlightReference) => {
            if (!user || !channelRef.current) return

            const message: Message = {
                id: crypto.randomUUID(),
                user: { name: user.name || 'Guest', id: user.id },
                text: content,
                timestamp: Date.now(),
                highlightRef,
            }

            // Send directly to other clients
            const result = await channelRef.current.send({
                type: 'broadcast',
                event: CHAT_MESSAGE_EVENT,
                payload: message,
            })

            if (result === 'ok') {
                // Add sender's own message to local state immediately
                setMessages((prev) => [...prev, message])
            } else {
                alert('Failed to send message')
            }
        },
        [user]
    )

    const value = useMemo(
        () => ({ onlineUsers, messages, sendMessage }),
        [onlineUsers, messages, sendMessage]
    )

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
