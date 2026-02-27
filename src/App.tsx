import { ChatWindow } from './components/chat-window'
import { RealtimeCursors } from './features/realtime-cursors/components/realtime-cursors'
import { useAuth } from './features/auth/hooks/use-auth'
import { PdfViewer } from './components/pdf-viewer'
import { getUserDisplayName } from './features/auth/utils/get-user-display-name'
import { useRealtimeCursors } from './features/realtime-cursors/hooks/use-realtime-cursors'

const ROOM_NAME = 'pdf_room'

function App() {
    const { user } = useAuth()

    const { cursors, savedHighlights, selections, addHighlight } =
        useRealtimeCursors({
            roomName: ROOM_NAME,
            username: getUserDisplayName(user),
        })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-start gap-5">
            <PdfViewer addHighlight={addHighlight} />
            <ChatWindow />
            {user && (
                <RealtimeCursors
                    cursors={cursors}
                    savedHighlights={savedHighlights}
                    selections={selections}
                />
            )}
        </div>
    )
}

export default App
