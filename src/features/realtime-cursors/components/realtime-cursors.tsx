import { usePdfViewerContext } from '@/features/pdf-viewer/providers/pdf-viewer-provider'
import { useReferencesContext } from '@/features/references/providers/references-provider'
import { cn } from '@/lib/utils'
import { useRealtimeCursorsContext } from '../providers/realtime-cursors-provider'
import { Cursor } from './cursor'
import { useAuthContext } from '@/features/auth/providers/auth-provider'

export const RealtimeCursors = () => {
    const { user } = useAuthContext()
    const { setClickedHighlight } = usePdfViewerContext()
    const { savedHighlights, selections, cursors } = useRealtimeCursorsContext()
    const { focusedHighlightId } = useReferencesContext()

    if (!user) return null

    return (
        <div>
            {/* Render Permanent Highlights */}
            {Object.entries(savedHighlights).map(([id, payload]) => (
                <div key={`saved-highlight-${id}`}>
                    {payload.rects.map((rect, index) => (
                        <div
                            key={`saved-rect-${id}-${index}`}
                            onClick={(e) => {
                                // stop propagation so PdfViewer's onMouseDown doesn't dismiss it
                                e.stopPropagation()
                                setClickedHighlight({
                                    payload,
                                    x: e.clientX + window.scrollX,
                                    y: e.clientY + window.scrollY,
                                })
                            }}
                            className={cn(
                                'absolute mix-blend-multiply z-40 cursor-pointer',
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
