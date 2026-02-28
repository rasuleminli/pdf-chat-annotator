import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/features/auth/providers/auth-provider'
import { supabase } from '@/lib/supabase'
import { AlertCircleIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'

export function AuthJoinChatForm() {
    const { loading: isUserLoading } = useAuthContext()

    const [name, setName] = useState('')
    const isNameTooLong = name.trim().length > 30
    const isNameValid = name.trim().length > 0 && !isNameTooLong

    const [joinError, setJoinError] = useState<string | null>(null)
    const [isJoining, setIsJoining] = useState(false)

    const joinChat = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isJoining || !isNameValid || isUserLoading) return
        setIsJoining(true)
        setJoinError(null)
        const { error } = await supabase.auth.signInAnonymously({
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
    }

    return (
        <div className="max-w-120 w-full self-center mx-auto flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">
                Please enter your name to join the chat.
            </h2>
            <div>
                <form onSubmit={joinChat} className="flex flex-col gap-3 mt-2">
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
    )
}
