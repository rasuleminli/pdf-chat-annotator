import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertCircleIcon, Loader2Icon } from 'lucide-react'
import { LogoutBtn } from '@/features/auth/components/logout-btn'

export function Chat() {
    const { user, loading: isUserLoading } = useAuth()

    const [name, setName] = useState('')
    const isNameValid = name.trim().length > 0 && name.trim().length <= 30

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
                                    setName(e.target.value)
                                }}
                                placeholder="Your name"
                                className="h-14 text-lg!"
                                disabled={isJoining}
                            />
                            <Button
                                type="submit"
                                disabled={!isNameValid || isJoining}
                                className="h-14 text-lg! cursor-pointer transition-none"
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
                    </div>
                </div>
            </ChatWrapper>
        )
    }

    return (
        <ChatWrapper>
            Joined chat as {user.user_metadata?.display_name || 'John Doe'}
            <LogoutBtn />
        </ChatWrapper>
    )
}

function ChatWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="border rounded-md overflow-hidden flex">{children}</div>
    )
}
