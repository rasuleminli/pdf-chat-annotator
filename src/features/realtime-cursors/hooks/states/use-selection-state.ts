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

export type SelectionEventPayload = {
    rects: SelectionRect[]
    user: { id: number; name: string }
    color: string
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
    const [selections, setSelections] = useState<
        Record<string, SelectionEventPayload>
    >({})

    const selectionCallback = useCallback(() => {
        const selection = window.getSelection()
        let rects: SelectionRect[] = []

        if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const domRects = Array.from(range.getClientRects())
            // Map DOMRects to custom SelectionRect, accounting for current scroll position
            rects = domRects.map((rect) => ({
                x: rect.x + window.scrollX,
                y: rect.y + window.scrollY,
                width: rect.width,
                height: rect.height,
            }))
        }

        const payload: SelectionEventPayload = {
            rects,
            user: { id: userId, name: username },
            color,
        }

        channelRef.current?.send({
            type: 'broadcast',
            event: EVENTS.TEXT_SELECTION,
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

    return { selections, setSelections }
}
