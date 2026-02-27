import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { EVENTS, THROTTLE_MS } from '../lib/constants'
import { useThrottleCallback } from '../use-throttle-callback'

type SelectionRect = {
    x: number
    y: number
    width: number
    height: number
}

export type SelectionPayload = {
    rects: SelectionRect[]
    user: { id: number; name: string }
    color: string
}

export type HighlightPayload = SelectionPayload & {
    id: string
    text: string
}

export const useSelectionState = ({
    userId,
    username,
    color,
    channelRef,
}: {
    userId: number
    username: string
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
            user: { id: userId, name: username },
            color,
        }

        channelRef.current?.send({
            type: 'broadcast',
            event: EVENTS.SELECTION,
            payload,
        })
    }, [color, userId, username, channelRef])

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
                user: { id: userId, name: username },
                color,
            }

            setSelections((prev) => ({
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
        [color, userId, username, channelRef]
    )

    return {
        selections,
        setSelections,
        addHighlight,
        savedHighlights,
        setSavedHighlights,
    }
}
