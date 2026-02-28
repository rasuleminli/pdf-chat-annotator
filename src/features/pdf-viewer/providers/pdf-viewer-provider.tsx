import { createContext, useContext, useEffect, useState } from 'react'
import type { PopoverState } from '../components/popover/types'
import type { HighlightPayload } from '@/lib/types'

type ClickedHighlight = {
    payload: HighlightPayload
    x: number
    y: number
}

type TPdfViewerContext = {
    popover: PopoverState | null
    setPopover: React.Dispatch<React.SetStateAction<PopoverState | null>>
    clickedHighlight: ClickedHighlight | null
    setClickedHighlight: React.Dispatch<
        React.SetStateAction<ClickedHighlight | null>
    >
}

const PdfViewerContext = createContext<TPdfViewerContext | null>(null)

export function usePdfViewerContext() {
    const ctx = useContext(PdfViewerContext)
    if (!ctx)
        throw new Error(
            'usePdfViewerContext must be used within PdfViewerProvider'
        )
    return ctx
}

export function PdfViewerProvider({ children }: { children: React.ReactNode }) {
    const [popover, setPopover] = useState<PopoverState | null>(null)

    // If the highlight is already created, show a popover on click
    const [clickedHighlight, setClickedHighlight] =
        useState<ClickedHighlight | null>(null)

    // Close popover and clear selection when user clicks anywhere else
    useEffect(() => {
        const handleMouseDown = () => {
            setClickedHighlight(null)
            setPopover(null)
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [])

    return (
        <PdfViewerContext
            value={{
                popover,
                setPopover,
                clickedHighlight,
                setClickedHighlight,
            }}
        >
            {children}
        </PdfViewerContext>
    )
}
