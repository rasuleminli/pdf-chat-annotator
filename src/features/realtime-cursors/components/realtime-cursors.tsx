import { Cursor } from '@/components/cursor'
import { useRealtimeCollaboration } from '../hooks/use-realtime-cursors'

export const RealtimeCursors = ({
    roomName,
    username,
}: {
    roomName: string
    username: string
}) => {
    const { cursors, selections } = useRealtimeCollaboration({
        roomName,
        username,
    })

    return (
        <div>
            {Object.entries(selections).map(([id, selectionPayload]) => (
                <div key={`selection-${id}`}>
                    {selectionPayload.rects.map((rect, index) => (
                        <div
                            key={`rect-${id}-${index}`}
                            className="absolute pointer-events-none mix-blend-multiply opacity-30 z-40"
                            style={{
                                top: rect.y,
                                left: rect.x,
                                width: rect.width,
                                height: rect.height,
                                backgroundColor: selectionPayload.color,
                            }}
                        />
                    ))}
                </div>
            ))}

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
