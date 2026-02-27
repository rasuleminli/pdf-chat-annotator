import type { SelectionRect } from '@/features/realtime-cursors/hooks/lib/types'
import type { PopoverState } from './types'
import type { Dispatch, SetStateAction } from 'react'

export function PopoverCard({
    popover,
    setPopover,
    addHighlight,
}: {
    popover: PopoverState
    setPopover: Dispatch<SetStateAction<PopoverState | null>>
    addHighlight: (rects: SelectionRect[], text: string) => string
}) {
    return (
        <div
            className="absolute z-50 transform -translate-x-1/2 -translate-y-full bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-3"
            style={{ left: popover.x, top: popover.y }}
            onMouseDown={(e) => {
                // Prevent the container's onMouseDown from firing and dismissing the card
                e.stopPropagation()
            }}
        >
            <span className="text-sm font-medium truncate max-w-[150px]">
                "{popover.text}"
            </span>
            <div className="w-px h-4 bg-slate-600" />
            <button
                className="text-sm text-blue-400 hover:text-blue-300 font-semibold whitespace-nowrap transition-colors"
                onClick={() => {
                    const highlightId = addHighlight(
                        popover.rects,
                        popover.text
                    )

                    // TODO: Pass this highlightId to the chat input
                    console.log('Pass this to chat:', highlightId)

                    // Clear the popover state
                    setPopover(null)
                    window.getSelection()?.removeAllRanges()
                }}
            >
                Reference in Chat
            </button>

            {/* Tooltip triangle pointer */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
    )
}
