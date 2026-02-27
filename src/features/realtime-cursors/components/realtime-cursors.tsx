import { Cursor } from '@/components/cursor'
import { useRealtimeCursors } from '../hooks/use-realtime-cursors'

export const RealtimeCursors = ({
    roomName,
    username,
}: {
    roomName: string
    username: string
}) => {
    const { cursors, savedHighlights, selections } = useRealtimeCursors({
        roomName,
        username,
    })

    return (
        <div>
            {/* Render Permanent Highlights */}
            {Object.entries(savedHighlights).map(([id, payload]) => (
                <div key={`saved-highlight-${id}`}>
                    {payload.rects.map((rect, index) => (
                        <div
                            key={`saved-rect-${id}-${index}`}
                            className="absolute pointer-events-none mix-blend-multiply opacity-40 z-40"
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
