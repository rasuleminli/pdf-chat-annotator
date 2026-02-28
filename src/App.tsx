import { useEffect, useState } from 'react'
import { ChatWindow } from './components/chat-window'
import { PdfViewer } from './components/pdf-viewer'
import { useAuth } from './features/auth/hooks/use-auth'
import { getUserDisplayName } from './features/auth/utils/get-user-display-name'
import { RealtimeCursors } from './features/realtime-cursors/components/realtime-cursors'
import { useRealtimeCursors } from './features/realtime-cursors/hooks/use-realtime-cursors'
import { useReferences } from './features/references/hooks/use-references'
import type { HighlightPayload } from './features/realtime-cursors/hooks/states/use-selection-state'
import type { PopoverState } from './lib/types'

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

    const [popover, setPopover] = useState<PopoverState | null>(null)

    // If the highlight is already created, show a popover on click
    const [clickedHighlight, setClickedHighlight] = useState<{
        payload: HighlightPayload
        x: number
        y: number
    } | null>(null)

    // Close popover and clear selection when user clicks anywhere else
    useEffect(() => {
        const handleMouseDown = () => {
            setClickedHighlight(null)
            setPopover(null)
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => {
            document.removeEventListener('mousedown', handleMouseDown)
        }
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-start gap-5">
            <PdfViewer
                popover={popover}
                setPopover={setPopover}
                handleReferenceInChat={handleReferenceInChat}
                clickedHighlight={clickedHighlight}
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
