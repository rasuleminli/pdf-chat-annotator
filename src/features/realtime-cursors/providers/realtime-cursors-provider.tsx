import { supabase } from '@/lib/supabase'
import type {
    HighlightPayload,
    SelectionPayload,
    SelectionRect,
} from '@/lib/types'
import {
    REALTIME_SUBSCRIBE_STATES,
    type RealtimeChannel,
} from '@supabase/supabase-js'
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useCursorState } from '../hooks/states/use-cursor-state'
import { useSelectionState } from '../hooks/states/use-selection-state'
import { EVENTS, ROOM_NAME } from '../lib/constants'
import type { CursorEventPayload } from '../lib/types'
import { useAuthContext } from '@/features/auth/providers/auth-provider'

type TRealtimeCursorsContext = {
    cursors: Record<string, CursorEventPayload>
    selections: Record<string, SelectionPayload>
    savedHighlights: Record<string, HighlightPayload>
    addHighlight: (rects: SelectionRect[], text: string) => string
    removeHighlight: (highlightId: string) => void
}

const RealtimeCursorsContext = createContext<TRealtimeCursorsContext | null>(
    null
)

export function useRealtimeCursorsContext() {
    const ctx = useContext(RealtimeCursorsContext)
    if (!ctx)
        throw new Error(
            'useRealtimeCursorsContext must be used within RealtimeCursorsProvider'
        )
    return ctx
}

/**
 * Helpers.
 */
const generateRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`

const generateRandomNumber = () => Math.floor(Math.random() * 100)

export function RealtimeCursorsProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const { user } = useAuthContext()

    // Because we never subscribe to a channel when there's no user,
    // it shouldn't reach this fallback.
    const userName = user?.name || 'Guest'

    const [color] = useState(generateRandomColor())
    const [userId] = useState(generateRandomNumber())

    const channelRef = useRef<RealtimeChannel | null>(null)

    const { cursors, setCursors, cursorPayload } = useCursorState({
        userId,
        userName,
        color,
        channelRef,
    })

    const {
        selections,
        setSelections,
        savedHighlights,
        setSavedHighlights,
        addHighlight,
        removeHighlight,
    } = useSelectionState({
        userId,
        userName,
        color,
        channelRef,
    })

    useEffect(() => {
        if (!user) return

        const channel = supabase.channel(ROOM_NAME)

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
                { event: EVENTS.REMOVE_HIGHLIGHT },
                (data: { payload: { id: string } }) => {
                    setSavedHighlights((prev) => {
                        const next = { ...prev }
                        delete next[data.payload.id]
                        return next
                    })
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
    }, [user])

    const value = useMemo(
        () => ({
            cursors,
            selections,
            savedHighlights,
            addHighlight,
            removeHighlight,
        }),
        [cursors, selections, savedHighlights, addHighlight, removeHighlight]
    )

    return (
        <RealtimeCursorsContext.Provider value={value}>
            {children}
        </RealtimeCursorsContext.Provider>
    )
}
