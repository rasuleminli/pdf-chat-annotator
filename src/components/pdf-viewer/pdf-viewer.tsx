import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import type { OnDocumentLoadSuccess } from 'react-pdf/src/shared/types.js'
import { useHighlightPopover } from './popover/use-highlight-popover'
import { PopoverCard } from './popover/popover-card'
import type { HandleReferenceInChatFn } from '@/features/references/lib/types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

const file = '/sample.pdf'
const pageNumber = 1

export function PdfViewer({
    onReferenceInChat,
}: {
    onReferenceInChat: HandleReferenceInChatFn
}) {
    const [numPages, setNumPages] = useState<number>()

    const onDocumentLoadSuccess: OnDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
    }

    const {
        containerRef,
        handleMouseUp,
        handleMouseDown,
        popover,
        setPopover,
    } = useHighlightPopover()

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
                    onReferenceInChat={onReferenceInChat}
                />
            )}

            <p>
                Page {pageNumber} of {numPages}
            </p>
        </div>
    )
}
