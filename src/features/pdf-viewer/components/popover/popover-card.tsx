import { useReferencesContext } from '@/features/references/providers/references-provider'
import { usePdfViewerContext } from '../../providers/pdf-viewer-provider'
import type { PopoverState } from './types'

type PopovercardProps = {
    popover: PopoverState
    userName?: string
}

export function PopoverCard({ popover, userName }: PopovercardProps) {
    const { setPopover } = usePdfViewerContext()
    const { handleReferenceInChat } = useReferencesContext()

    return (
        <div
            className="absolute z-50 transform -translate-x-1/2 -translate-y-full bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl flex flex-col items-center gap-1.5 select-none"
            style={{ left: popover.x, top: popover.y }}
            onMouseDown={(e) => {
                // Prevent the container's onMouseDown from firing and dismissing the card
                e.stopPropagation()
            }}
        >
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium truncate max-w-[150px]">
                    "{popover.text}"
                </span>

                <div className="w-px h-4 bg-slate-600" />

                <button
                    className="text-sm text-blue-400 hover:text-blue-300 font-semibold whitespace-nowrap transition-colors"
                    onClick={() => {
                        handleReferenceInChat(popover.rects, popover.text)

                        // Clear the popover state
                        setPopover(null)
                        window.getSelection()?.removeAllRanges()
                    }}
                >
                    Reference in Chat
                </button>
            </div>

            {userName && (
                <span className="text-sm text-slate-400">
                    Highlighted by {userName}
                </span>
            )}

            {/* Tooltip triangle pointer */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
    )
}
