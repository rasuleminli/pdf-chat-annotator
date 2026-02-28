import { useState, type Dispatch, type SetStateAction } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import type { OnDocumentLoadSuccess } from 'react-pdf/src/shared/types.js'
import { useHighlightPopover } from './popover/use-highlight-popover'
import { PopoverCard } from './popover/popover-card'
import type { HandleReferenceInChatFn } from '@/features/references/lib/types'
import type { HighlightPayload } from '@/features/realtime-cursors/hooks/states/use-selection-state'
import type { PopoverState } from '@/lib/types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

const file = '/sample.pdf'
const pageNumber = 1

export function PdfViewer({
    popover,
    setPopover,
    handleReferenceInChat,
    clickedHighlight,
}: {
    popover: PopoverState | null
    setPopover: Dispatch<SetStateAction<PopoverState | null>>
    handleReferenceInChat: HandleReferenceInChatFn
    clickedHighlight: {
        payload: HighlightPayload
        x: number
        y: number
    } | null
}) {
    const [numPages, setNumPages] = useState<number>()

    const onDocumentLoadSuccess: OnDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
    }

    const { containerRef, handleMouseUp, handleMouseDown } =
        useHighlightPopover({ popover, setPopover })

    return (
        <div
            ref={containerRef}
            onMouseUp={handleMouseUp}
            onMouseDown={handleMouseDown}
            className="border rounded-md overflow-hidden shrink-0"
        >
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
            </Document>

            {popover && (
                <PopoverCard
                    popover={popover}
                    setPopover={setPopover}
                    handleReferenceInChat={handleReferenceInChat}
                />
            )}

            {clickedHighlight && (
                <PopoverCard
                    popover={{
                        x: clickedHighlight.x,
                        y: clickedHighlight.y,
                        text: clickedHighlight.payload.text,
                        rects: clickedHighlight.payload.rects,
                    }}
                    setPopover={setPopover}
                    handleReferenceInChat={handleReferenceInChat}
                    userName={clickedHighlight.payload.user.name}
                />
            )}

            <p>
                Page {pageNumber} of {numPages}
            </p>
        </div>
    )
}
