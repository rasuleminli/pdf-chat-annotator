import {
    REALTIME_SUBSCRIBE_STATES,
    RealtimeChannel,
} from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'

/**
 * Throttle a callback to a certain delay, It will only call the callback if the delay has passed, with the arguments
 * from the last call
 */
const useThrottleCallback = <Params extends unknown[], Return>(
    callback: (...args: Params) => Return,
    delay: number
) => {
    const lastCall = useRef(0)
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

    return useCallback(
        (...args: Params) => {
            const now = Date.now()
            const remainingTime = delay - (now - lastCall.current)

            if (remainingTime <= 0) {
                if (timeout.current) {
                    clearTimeout(timeout.current)
                    timeout.current = null
                }
                lastCall.current = now
                callback(...args)
            } else if (!timeout.current) {
                timeout.current = setTimeout(() => {
                    lastCall.current = Date.now()
                    timeout.current = null
                    callback(...args)
                }, remainingTime)
            }
        },
        [callback, delay]
    )
}

const generateRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`

const generateRandomNumber = () => Math.floor(Math.random() * 100)

const EVENTS = {
    CURSOR_MOVE: 'cursor-move',
    TEXT_SELECTION: 'text-selection',
} as const

// Cursor Move
type CursorEventPayload = {
    position: {
        x: number
        y: number
    }
    user: {
        id: number
        name: string
    }
    color: string
    timestamp: number
}

// Text Selection
type SelectionRect = { x: number; y: number; width: number; height: number }
type SelectionEventPayload = {
    rects: SelectionRect[]
    user: { id: number; name: string }
    color: string
}

// TODO: clean-up, separate two states into two different hooks
export const useRealtimeCursors = ({
    roomName,
    username,
    throttleMs,
}: {
    roomName: string
    username: string
    throttleMs: number
}) => {
    const [color] = useState(generateRandomColor())
    const [userId] = useState(generateRandomNumber())

    // States for both events
    const [cursors, setCursors] = useState<Record<string, CursorEventPayload>>(
        {}
    )
    const [selections, setSelections] = useState<
        Record<string, SelectionEventPayload>
    >({})

    const cursorPayload = useRef<CursorEventPayload | null>(null)
    const channelRef = useRef<RealtimeChannel | null>(null)

    const cursorCallback = useCallback(
        (event: MouseEvent) => {
            const { clientX, clientY } = event

            const payload: CursorEventPayload = {
                position: {
                    x: clientX,
                    y: clientY,
                },
                user: {
                    id: userId,
                    name: username,
                },
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
        [color, userId, username]
    )
    const handleCursorMove = useThrottleCallback(cursorCallback, throttleMs)

    // Selection Callback
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
    }, [color, userId, username])

    const handleSelectionChange = useThrottleCallback(
        selectionCallback,
        throttleMs
    )

    useEffect(() => {
        const channel = supabase.channel(roomName)

        channel
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                leftPresences.forEach(function (element) {
                    // Remove cursor when user leaves
                    setCursors((prev) => {
                        if (prev[element.key]) {
                            delete prev[element.key]
                        }

                        return { ...prev }
                    })
                })
            })
            .on('presence', { event: 'join' }, () => {
                if (!cursorPayload.current) return

                // All cursors broadcast their position when a new cursor joins
                channelRef.current?.send({
                    type: 'broadcast',
                    event: EVENTS.CURSOR_MOVE,
                    payload: cursorPayload.current,
                })
            })
            .on(
                'broadcast',
                { event: EVENTS.CURSOR_MOVE },
                (data: { payload: CursorEventPayload }) => {
                    const { user } = data.payload
                    // Don't render your own cursor
                    if (user.id === userId) return

                    setCursors((prev) => {
                        if (prev[userId]) {
                            delete prev[userId]
                        }

                        return {
                            ...prev,
                            [user.id]: data.payload,
                        }
                    })
                }
            )
            .on(
                'broadcast',
                { event: EVENTS.TEXT_SELECTION },
                (data: { payload: SelectionEventPayload }) => {
                    if (data.payload.user.id === userId) return
                    setSelections((prev) => ({
                        ...prev,
                        [data.payload.user.id]: data.payload,
                    }))
                }
            )
            .subscribe(async (status) => {
                if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
                    await channel.track({ key: userId })
                    channelRef.current = channel
                } else {
                    setCursors({})
                    setSelections({})
                    channelRef.current = null
                }
            })

        return () => {
            channel.unsubscribe()
            channelRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        // Add event listener for mousemove
        window.addEventListener('mousemove', handleCursorMove)
        document.addEventListener('selectionchange', handleSelectionChange)

        // Cleanup on unmount
        return () => {
            window.removeEventListener('mousemove', handleCursorMove)
            document.removeEventListener(
                'selectionchange',
                handleSelectionChange
            )
        }
    }, [handleCursorMove, handleSelectionChange])

    return { cursors, selections }
}
