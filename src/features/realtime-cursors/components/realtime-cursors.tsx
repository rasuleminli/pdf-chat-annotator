import { Cursor } from '@/components/cursor'
import type { CursorEventPayload } from '../hooks/states/use-cursor-state'
import type {
    HighlightPayload,
    SelectionPayload,
} from '../hooks/states/use-selection-state'
import { cn } from '@/lib/utils'

export const RealtimeCursors = ({
    cursors,
    savedHighlights,
    selections,
    focusedHighlightId,
}: {
    cursors: Record<string, CursorEventPayload>
    savedHighlights: Record<string, HighlightPayload>
    selections: Record<string, SelectionPayload>
    focusedHighlightId: string | null
}) => {
    return (
        <div>
            {/* Render Permanent Highlights */}
            {Object.entries(savedHighlights).map(([id, payload]) => (
                <div key={`saved-highlight-${id}`}>
                    {payload.rects.map((rect, index) => (
                        <div
                            key={`saved-rect-${id}-${index}`}
                            className={cn(
                                'absolute pointer-events-none mix-blend-multiply z-40',
                                focusedHighlightId && focusedHighlightId === id
                                    ? 'opacity-80 animate-pulse'
                                    : 'opacity-40'
                            )}
                            style={{
                                top: rect.y,
                                left: rect.x,
                                width: rect.width,
                                height: rect.height,
                                backgroundColor: payload.color,
                            }}
                        />
                    ))}
                </div>
            ))}

            {/* Render Temporary Live Selections */}
            {Object.entries(selections).map(([id, payload]) => (
                <div key={`selection-${id}`}>
                    {payload.rects.map((rect, index) => (
                        <div
                            key={`active-rect-${id}-${index}`}
                            className="absolute pointer-events-none mix-blend-multiply opacity-20 z-40"
                            style={{
                                top: rect.y,
                                left: rect.x,
                                width: rect.width,
                                height: rect.height,
                                backgroundColor: payload.color,
                            }}
                        />
                    ))}
                </div>
            ))}

            {/* Render Cursors */}
            {Object.keys(cursors).map((id) => (
                <Cursor
                    key={id}
                    className="fixed transition-transform ease-in-out z-50"
                    style={{
                        transitionDuration: '20ms',
                        top: 0,
                        left: 0,
                        transform: `translate(${cursors[id].position.x}px, ${cursors[id].position.y}px)`,
                    }}
                    color={cursors[id].color}
                    name={cursors[id].user.name}
                />
            ))}
        </div>
    )
}
