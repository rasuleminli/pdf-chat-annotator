import { useState } from 'react'
import type { HighlightReference } from '../lib/types'
import type { SelectionRect } from '@/features/realtime-cursors/hooks/lib/types'

export const useReferences = ({
    addHighlight,
    removeHighlight,
}: {
    addHighlight: (rects: SelectionRect[], text: string) => string
    removeHighlight: (highlightId: string) => void
}) => {
    // Set by PopoverCard when user clicks "Reference in Chat".
    // Passed into ChatWindow so it can show the pending chip.
    const [pendingHighlightRef, setPendingHighlightRef] =
        useState<HighlightReference | null>(null)

    // This will be used to trigger the flash animation and scroll to the highlight.
    // TODO: Implement the flash animation.
    // TODO: Implement scrolling (switching page) to the highlight.
    const [focusedHighlightId, setFocusedHighlightId] = useState<string | null>(
        null
    )

    // Called from PopoverCard. Saves the highlight and queues it as a pending
    // reference in the chat input.
    const handleReferenceInChat = (rects: SelectionRect[], text: string) => {
        const id = addHighlight(rects, text)
        setPendingHighlightRef({ id, text })
    }

    // Used when message is sent, just clears the pending ref.
    const clearPendingRef = () => setPendingHighlightRef(null)

    // Used when user clicks the "x" button in the pending ref - also removes the highlight.
    const dismissPendingRef = () => {
        if (pendingHighlightRef) {
            removeHighlight(pendingHighlightRef.id)
        }
        setPendingHighlightRef(null)
    }

    return {
        handleReferenceInChat,
        pendingHighlightRef,
        clearPendingRef,
        dismissPendingRef,
        setFocusedHighlightId,
    }
}
