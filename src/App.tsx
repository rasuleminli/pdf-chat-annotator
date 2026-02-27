import { ChatWindow } from './components/chat-window'
import { RealtimeCursors } from './components/realtime-cursors'
import { useAuth } from './features/auth/hooks/use-auth'
import { PdfViewer } from './components/pdf-viewer'
import { getUserDisplayName } from './features/auth/utils/get-user-display-name'

const ROOM_NAME = 'pdf_room'

function App() {
    const { user } = useAuth()

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-start gap-5">
            <PdfViewer />
            <ChatWindow />
            {user && (
                <RealtimeCursors
                    roomName={ROOM_NAME}
                    username={getUserDisplayName(user)}
                />
            )}
        </div>
    )
}

export default App
