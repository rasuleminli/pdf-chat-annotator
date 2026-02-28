import { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useThrottleCallback } from '../use-throttle-callback'
import { EVENTS, THROTTLE_MS } from '../../lib/constants'
import type { CursorEventPayload } from '../../lib/types'

export const useCursorState = ({
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
    const [cursors, setCursors] = useState<Record<string, CursorEventPayload>>(
        {}
    )
    const cursorPayload = useRef<CursorEventPayload | null>(null)

    const cursorCallback = useCallback(
        (event: MouseEvent) => {
            const payload: CursorEventPayload = {
                position: { x: event.clientX, y: event.clientY },
                user: { id: userId, name: userName },
                color,
                timestamp: new Date().getTime(),
            }

            cursorPayload.current = payload
            channelRef.current?.send({
                type: 'broadcast',
                event: EVENTS.CURSOR_MOVE,
                payload,
            })
        },
        [color, userId, userName, channelRef]
    )

    const handleCursorMove = useThrottleCallback(cursorCallback, THROTTLE_MS)

    useEffect(() => {
        window.addEventListener('mousemove', handleCursorMove)
        return () => window.removeEventListener('mousemove', handleCursorMove)
    }, [handleCursorMove])

    return { cursors, setCursors, cursorPayload }
}
