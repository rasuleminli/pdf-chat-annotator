import type { SelectionRect } from '@/lib/types'
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { HighlightReference } from '@/lib/types'
import { useRealtimeCursorsContext } from '@/features/realtime-cursors/providers/realtime-cursors-provider'

type TReferencesContext = {
    pendingHighlightRef: HighlightReference | null
    focusedHighlightId: string | null
    handleReferenceInChat: (rects: SelectionRect[], text: string) => void
    clearPendingRef: () => void
    dismissPendingRef: () => void
    handleFocusHighlight: (highlightId: string) => void
}

const ReferencesContext = createContext<TReferencesContext | null>(null)

const PULSE_ANIMATION_DURATION = 1500

export function useReferencesContext() {
    const ctx = useContext(ReferencesContext)
    if (!ctx)
        throw new Error(
            'useReferencesContext must be used within ReferencesProvider'
        )
    return ctx
}

export function ReferencesProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const { addHighlight, removeHighlight } = useRealtimeCursorsContext()

    // Set by PopoverCard when user clicks "Reference in Chat".
    // Passed into ChatWindow so it can show the pending chip.
    const [pendingHighlightRef, setPendingHighlightRef] =
        useState<HighlightReference | null>(null)

    // This will be used to trigger the flash animation and scroll to the highlight.
    // TODO: Implement scrolling (switching page) to the highlight.
    const [focusedHighlightId, setFocusedHighlightId] = useState<string | null>(
        null
    )

    const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleFocusHighlight = useCallback((highlightId: string) => {
        if (focusTimerRef.current) {
            clearTimeout(focusTimerRef.current)
        }
        setFocusedHighlightId(highlightId)
        focusTimerRef.current = setTimeout(
            () => setFocusedHighlightId(null),
            PULSE_ANIMATION_DURATION
        )
    }, [])

    // Called from PopoverCard. Saves the highlight and queues it as a pending
    // reference in the chat input.
    const handleReferenceInChat = useCallback(
        (rects: SelectionRect[], text: string) => {
            // Remove the pending highlight if it exists.
            // (since there can only be one pending highlight at a time)
            if (pendingHighlightRef) {
                removeHighlight(pendingHighlightRef.id)
            }
            const id = addHighlight(rects, text)
            setPendingHighlightRef({ id, text })
        },
        [removeHighlight, pendingHighlightRef, addHighlight]
    )

    // Used when message is sent, just clears the pending ref.
    const clearPendingRef = useCallback(() => setPendingHighlightRef(null), [])

    // Used when user clicks the "x" button in the pending ref - also removes the highlight.
    const dismissPendingRef = useCallback(() => {
        if (pendingHighlightRef) {
            removeHighlight(pendingHighlightRef.id)
        }
        setPendingHighlightRef(null)
    }, [pendingHighlightRef, removeHighlight])

    const value = useMemo(
        () => ({
            pendingHighlightRef,
            focusedHighlightId,
            handleReferenceInChat,
            clearPendingRef,
            dismissPendingRef,
            handleFocusHighlight,
        }),
        [
            pendingHighlightRef,
            focusedHighlightId,
            handleReferenceInChat,
            clearPendingRef,
            dismissPendingRef,
            handleFocusHighlight,
        ]
    )

    return (
        <ReferencesContext.Provider value={value}>
            {children}
        </ReferencesContext.Provider>
    )
}
