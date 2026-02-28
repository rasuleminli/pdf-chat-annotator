import { useRef } from 'react'
import { usePdfViewerContext } from '../../providers/pdf-viewer-provider'

// The popover that appears when user selects text in the PDF viewer
export const useHighlightPopover = () => {
    const { popover, setPopover } = usePdfViewerContext()

    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseUp = () => {
        const selection = window.getSelection()

        if (
            !selection ||
            selection.isCollapsed ||
            selection.toString().trim() === ''
        ) {
            return
        }

        const range = selection.getRangeAt(0)
        const text = selection.toString()
        const clientRects = Array.from(range.getClientRects())

        if (clientRects.length === 0 || !containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()

        // Map DOM coordinates to coordinates relative to the PDF container
        const relativeRects = clientRects.map((rect) => ({
            x: rect.left - containerRect.left + window.scrollX,
            y: rect.top - containerRect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        }))

        // Calculate popover position (centered above the first line of the selection)
        const firstRect = clientRects[0]
        const popoverX =
            firstRect.left - containerRect.left + firstRect.width / 2
        const popoverY = firstRect.top - containerRect.top - 10 // 10px spacing above the text

        setPopover({
            x: popoverX,
            y: popoverY,
            text,
            rects: relativeRects,
        })
    }

    const handleMouseDown = () => {
        // Dismiss the popover if the user clicks anywhere else
        if (popover) {
            setPopover(null)
        }
    }

    return { containerRef, handleMouseUp, handleMouseDown }
}
