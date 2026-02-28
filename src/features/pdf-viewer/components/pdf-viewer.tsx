import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import type { OnDocumentLoadSuccess } from 'react-pdf/src/shared/types.js'
import { usePdfViewerContext } from '../providers/pdf-viewer-provider'
import { PopoverCard } from './popover/popover-card'
import { useHighlightPopover } from './popover/use-highlight-popover'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

const file = '/sample.pdf'
const pageNumber = 1

export function PdfViewer() {
    const { popover, clickedHighlight } = usePdfViewerContext()

    const { containerRef, handleMouseUp, handleMouseDown } =
        useHighlightPopover()

    const [numPages, setNumPages] = useState<number>(0)
    const onDocumentLoadSuccess: OnDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
    }

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

            {popover && <PopoverCard popover={popover} />}

            {clickedHighlight && (
                <PopoverCard
                    popover={{
                        x: clickedHighlight.x,
                        y: clickedHighlight.y,
                        text: clickedHighlight.payload.text,
                        rects: clickedHighlight.payload.rects,
                    }}
                    userName={clickedHighlight.payload.user.name}
                />
            )}

            <p>
                Page {pageNumber} of {numPages}
            </p>
        </div>
    )
}
