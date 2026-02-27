import { useState } from 'react'
import { ChatWindow } from './components/chat-window'
import { PdfViewer } from './components/pdf-viewer'
import { useAuth } from './features/auth/hooks/use-auth'
import { getUserDisplayName } from './features/auth/utils/get-user-display-name'
import { RealtimeCursors } from './features/realtime-cursors/components/realtime-cursors'
import { useRealtimeCursors } from './features/realtime-cursors/hooks/use-realtime-cursors'
import { useReferences } from './features/references/hooks/use-references'
import type { HighlightPayload } from './features/realtime-cursors/hooks/states/use-selection-state'

const ROOM_NAME = 'pdf_room'

function App() {
    const { user } = useAuth()

    const {
        cursors,
        savedHighlights,
        selections,
        addHighlight,
        removeHighlight,
    } = useRealtimeCursors({
        roomName: ROOM_NAME,
        username: getUserDisplayName(user),
    })

    const {
        pendingHighlightRef,
        focusedHighlightId,
        handleReferenceInChat,
        clearPendingRef,
        dismissPendingRef,
        handleFocusHighlight,
    } = useReferences({ addHighlight, removeHighlight })

    // If the highlight is already created, show a popover on click
    const [clickedHighlight, setClickedHighlight] = useState<{
        payload: HighlightPayload
        x: number
        y: number
    } | null>(null)

    const closeClickedHighlight = () => setClickedHighlight(null)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-start gap-5">
            <PdfViewer
                handleReferenceInChat={handleReferenceInChat}
                clickedHighlight={clickedHighlight}
                closeClickedHighlight={closeClickedHighlight}
            />
            <ChatWindow
                pendingHighlightRef={pendingHighlightRef}
                clearPendingRef={clearPendingRef}
                dismissPendingRef={dismissPendingRef}
                handleFocusHighlight={handleFocusHighlight}
            />
            {user && (
                <RealtimeCursors
                    cursors={cursors}
                    savedHighlights={savedHighlights}
                    selections={selections}
                    focusedHighlightId={focusedHighlightId}
                    onHighlightClick={(
                        payload: HighlightPayload,
                        x: number,
                        y: number
                    ) => setClickedHighlight({ payload, x, y })}
                />
            )}
        </div>
    )
}

export default App
