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
    type HighlightPayload,
    type SelectionPayload,
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
export const useRealtimeCursors = ({
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

    const {
        selections,
        setSelections,
        savedHighlights,
        setSavedHighlights,
        addHighlight,
    } = useSelectionState({
        userId,
        username,
        color,
        channelRef,
    })

    useEffect(() => {
        const channel = supabase.channel(roomName)

        channel
            .on('presence', { event: 'join' }, () => {
                if (!cursorPayload.current) return

                // All cursors broadcast their position when a new cursor joins
                channelRef.current?.send({
                    type: 'broadcast',
                    event: EVENTS.CURSOR_MOVE,
                    payload: cursorPayload.current,
                })

                // TODO: implement a mechanism to share the existing selections with the new joined user
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
                { event: EVENTS.ADD_HIGHLIGHT },
                (data: { payload: HighlightPayload }) => {
                    if (data.payload.user.id === userId) return
                    setSavedHighlights((prev) => ({
                        ...prev,
                        [data.payload.id]: data.payload,
                    }))
                }
            )
            .on(
                'broadcast',
                { event: EVENTS.SELECTION },
                (data: { payload: SelectionPayload }) => {
                    if (data.payload.user.id === userId) return

                    setSelections((prev) => {
                        // If rects are empty, the user cleared their selection
                        if (data.payload.rects.length === 0) {
                            const newState = { ...prev }
                            delete newState[data.payload.user.id]
                            return newState
                        }
                        return {
                            ...prev,
                            [data.payload.user.id]: data.payload,
                        }
                    })
                }
            )
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                leftPresences.forEach((element) => {
                    // Remove cursor
                    setCursors((prev) => {
                        if (prev[element.key]) {
                            delete prev[element.key]
                        }

                        return { ...prev }
                    })

                    // Clear temporary selection
                    setSelections((prev) => {
                        const newActive = { ...prev }
                        delete newActive[element.key]
                        return newActive
                    })

                    // Clear saved highlights tied to this user
                    setSavedHighlights((prev) => {
                        const newSaved = { ...prev }
                        Object.keys(newSaved).forEach((highlightId) => {
                            if (
                                newSaved[highlightId].user.id.toString() ===
                                element.key
                            ) {
                                delete newSaved[highlightId]
                            }
                        })
                        return newSaved
                    })
                })
            })
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

    return { cursors, selections, savedHighlights, addHighlight }
}
