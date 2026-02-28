import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

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

    // Resize the rendered PDF to take the full width of the container
    const [computedDocWidth, setComputedDocWidth] = useState<number>()
    useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver(([entry]) => {
            setComputedDocWidth(entry.contentRect.width)
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [containerRef])

    return (
        <div className="flex flex-col lg:col-span-13">
            <div
                ref={containerRef}
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
                className="border rounded-md overflow-hidden"
            >
                <Document file={file}>
                    <Page width={computedDocWidth} pageNumber={pageNumber} />
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
            </div>
        </div>
    )
}
