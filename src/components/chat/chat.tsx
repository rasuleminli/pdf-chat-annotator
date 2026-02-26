import { LogoutBtn } from '@/features/auth/components/logout-btn'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getUserDisplayName } from '@/features/auth/utils/get-user-display-name'
import { AuthJoinChatForm } from './components/auth-join-chat-form'
import { useLiveChat } from './hooks/use-live-chat'

function ChatInner() {
    const { user, loading: isUserLoading } = useAuth()

    const { onlineUsers } = useLiveChat(user)

    if (isUserLoading) {
        return 'Loading...'
    }

    if (!user) {
        return <AuthJoinChatForm />
    }

    return (
        <div className="flex flex-col items-start gap-2">
            <p>Joined chat as {getUserDisplayName(user)}</p>
            <p>Online users: {onlineUsers.length}</p>
            <LogoutBtn />
        </div>
    )
}

export function Chat() {
    return (
        <div className="border rounded-md overflow-hidden flex p-4">
            <ChatInner />
        </div>
    )
}
