import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { EVENTS, THROTTLE_MS } from '../../lib/constants'
import { useThrottleCallback } from '../use-throttle-callback'
import type {
    HighlightPayload,
    SelectionPayload,
    SelectionRect,
} from '@/lib/types'

export const useSelectionState = ({
    userId,
    userName,
    color,
    channelRef,
}: {
    userId: number
    userName: string
    color: string
    channelRef: React.RefObject<RealtimeChannel | null>
}) => {
    // 1 per user
    const [selections, setSelections] = useState<
        Record<string, SelectionPayload>
    >({})

    // unlimited per user
    const [savedHighlights, setSavedHighlights] = useState<
        Record<string, HighlightPayload>
    >({})

    const selectionCallback = useCallback(() => {
        const selection = window.getSelection()
        let rects: SelectionRect[] = []

        if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const domRects = Array.from(range.getClientRects())
            rects = domRects.map((rect) => ({
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY,
                width: rect.width,
                height: rect.height,
            }))
        }

        const payload: SelectionPayload = {
            rects,
            user: { id: userId, name: userName },
            color,
        }

        channelRef.current?.send({
            type: 'broadcast',
            event: EVENTS.SELECTION,
            payload,
        })
    }, [color, userId, userName, channelRef])

    const handleSelectionChange = useThrottleCallback(
        selectionCallback,
        THROTTLE_MS
    )

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange)
        return () =>
            document.removeEventListener(
                'selectionchange',
                handleSelectionChange
            )
    }, [handleSelectionChange])

    const addHighlight = useCallback(
        (rects: SelectionRect[], text: string) => {
            const highlightId = crypto.randomUUID()

            const payload: HighlightPayload = {
                id: highlightId,
                text,
                rects,
                user: { id: userId, name: userName },
                color,
            }

            // If the highlight already exists, reuse it.
            const existing = Object.values(savedHighlights).find(
                (highlight) => highlight.text === text
            )
            if (existing) return existing.id

            setSavedHighlights((prev) => ({
                ...prev,
                [highlightId]: payload,
            }))

            // Broadcast to the room
            channelRef.current?.send({
                type: 'broadcast',
                event: EVENTS.ADD_HIGHLIGHT,
                payload,
            })

            return highlightId
        },
        [userId, userName, color, savedHighlights, channelRef]
    )

    const removeHighlight = useCallback(
        (highlightId: string) => {
            setSavedHighlights((prev) => {
                const newSelections = { ...prev }
                delete newSelections[highlightId]
                return newSelections
            })

            // Broadcast to the room
            channelRef.current?.send({
                type: 'broadcast',
                event: EVENTS.REMOVE_HIGHLIGHT,
                payload: { id: highlightId },
            })
        },
        [channelRef]
    )

    return {
        selections,
        setSelections,
        savedHighlights,
        setSavedHighlights,
        addHighlight,
        removeHighlight,
    }
}
