import {
    REALTIME_SUBSCRIBE_STATES,
    RealtimeChannel,
} from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { EVENTS } from './lib/constants'
import {
    useCursorState,
    type CursorEventPayload,
} from './states/use-cursor-state'
import {
    useSelectionState,
    type SelectionEventPayload,
} from './states/use-selection-state'

/**
 * Helpers.
 */
const generateRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`

const generateRandomNumber = () => Math.floor(Math.random() * 100)

/**
 * Main hook that handles both cursors and selections states.
 */
export const useRealtimeCollaboration = ({
    roomName,
    username,
}: {
    roomName: string
    username: string
}) => {
    const [color] = useState(generateRandomColor())
    const [userId] = useState(generateRandomNumber())

    const channelRef = useRef<RealtimeChannel | null>(null)

    const { cursors, setCursors, cursorPayload } = useCursorState({
        userId,
        username,
        color,
        channelRef,
    })

    const { selections, setSelections } = useSelectionState({
        userId,
        username,
        color,
        channelRef,
    })

    useEffect(() => {
        const channel = supabase.channel(roomName)

        channel
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                leftPresences.forEach((element) => {
                    // Remove cursor when user leaves
                    setCursors((prev) => {
                        if (prev[element.key]) {
                            delete prev[element.key]
                        }

                        return { ...prev }
                    })
                    // Clear selections when user leaves
                    setSelections((prev) => {
                        if (prev[element.key]) {
                            const newSelections = { ...prev }
                            delete newSelections[element.key]
                            return newSelections
                        }
                        return prev
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

    return { cursors, selections }
}
