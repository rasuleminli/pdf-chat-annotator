import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertCircleIcon, Loader2Icon } from 'lucide-react'
import { LogoutBtn } from '@/features/auth/components/logout-btn'
import type { User } from '@supabase/supabase-js'

const getUserDisplayName = (user: User) => {
    return typeof user.user_metadata?.display_name === 'string'
        ? user.user_metadata.display_name
        : 'Guest'
}

export function Chat() {
    const { user, loading: isUserLoading } = useAuth()

    const [name, setName] = useState('')
    const isNameTooLong = name.trim().length > 30
    const isNameValid = name.trim().length > 0 && !isNameTooLong

    /**
     * Join chat functionality
     */
    const [joinError, setJoinError] = useState<string | null>(null)
    const [isJoining, setIsJoining] = useState(false)

    const joinChat = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isJoining || !isNameValid || isUserLoading) return
        setIsJoining(true)
        setJoinError(null)
        const { data, error } = await supabase.auth.signInAnonymously({
            options: {
                data: { display_name: name },
            },
        })
        if (error) {
            setIsJoining(false)
            setJoinError(error.message)
            return
        }
        setIsJoining(false)
        setJoinError(null)
        console.log(data)
    }

    /**
     * Presence Channel
     * https://supabase.com/docs/guides/realtime/presence
     */
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

    if (isUserLoading) {
        return <ChatWrapper>Loading...</ChatWrapper>
    }

    if (!user) {
        return (
            <ChatWrapper>
                <div className="max-w-120 w-full self-center mx-auto flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold">
                        Please enter your name to join the chat.
                    </h2>
                    <div>
                        <form
                            onSubmit={joinChat}
                            className="flex flex-col gap-3 mt-2"
                        >
                            <Input
                                autoFocus
                                value={name}
                                onChange={(e) => {
                                    if (isJoining) return
                                    setJoinError(null)
                                    setName(e.target.value)
                                }}
                                placeholder="Your name"
                                className="h-14 text-lg!"
                                disabled={isJoining}
                            />

                            <Button
                                type="submit"
                                disabled={!isNameValid || isJoining}
                                className="h-14 text-lg! transition-none"
                            >
                                {isJoining ? (
                                    <>
                                        Joining...
                                        <Loader2Icon className="size-6 animate-spin" />
                                    </>
                                ) : name.trim() === '' ? (
                                    'Join Chat'
                                ) : (
                                    `Join as ${name}`
                                )}
                            </Button>
                        </form>
                        {joinError && (
                            <p className="text-sm self-start flex gap-2 items-center mt-2">
                                <AlertCircleIcon className="size-4" />
                                {joinError}
                            </p>
                        )}
                        {isNameTooLong && (
                            <p className="text-sm self-start mt-2">
                                Woah, this name is too long!
                            </p>
                        )}
                    </div>
                </div>
            </ChatWrapper>
        )
    }

    return (
        <ChatWrapper>
            <div className="flex flex-col items-start gap-2">
                <p>Joined chat as {getUserDisplayName(user)}</p>
                <p>Online users: {onlineUsers.length}</p>
                <LogoutBtn />
            </div>
        </ChatWrapper>
    )
}

function ChatWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="border rounded-md overflow-hidden flex p-4">
            {children}
        </div>
    )
}
