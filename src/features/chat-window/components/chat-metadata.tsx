import { LogoutBtn } from '@/features/auth/components/logout-btn'
import { useAuthContext } from '@/features/auth/providers/auth-provider'
import { useChatContext } from '../providers/chat-provider'

export function ChatMetadata() {
    const { user } = useAuthContext()
    const { onlineUsers } = useChatContext()

    if (!user) return null

    return (
        <div className="flex items-start justify-between">
            <div className="flex flex-col items-start gap-1">
                <p>
                    Joined chat as{' '}
                    <span className="font-semibold">{user.name}</span>
                </p>
                <p>
                    Online users:{' '}
                    <span className="font-semibold">{onlineUsers.length}</span>
                </p>
            </div>
            <LogoutBtn />
        </div>
    )
}
