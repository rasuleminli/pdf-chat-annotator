import { useAuth } from '@/features/auth/hooks/use-auth'
import { useLiveChat } from '../hooks/use-live-chat'
import { getUserDisplayName } from '@/features/auth/utils/get-user-display-name'
import { LogoutBtn } from '@/features/auth/components/logout-btn'

export function ChatMetadata() {
    const { user } = useAuth()

    const { onlineUsers } = useLiveChat(user)

    if (!user) {
        return null
    }

    return (
        <div className="flex items-start justify-between">
            <div className="flex flex-col items-start gap-1">
                <p>
                    Joined chat as{' '}
                    <span className="font-semibold">
                        {getUserDisplayName(user)}
                    </span>
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
