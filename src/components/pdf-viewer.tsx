import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import type { OnDocumentLoadSuccess } from 'react-pdf/src/shared/types.js'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

const file = '/sample.pdf'
const pageNumber = 1

export function PdfViewer() {
    const [numPages, setNumPages] = useState<number>()

    const onDocumentLoadSuccess: OnDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
    }

    return (
        <div>
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                options={{
                    cMapUrl: '/cmaps/',
                    standardFontDataUrl: '/standard_fonts/',
                }}
            >
                <Page pageNumber={pageNumber} />
            </Document>
            <p>
                Page {pageNumber} of {numPages}
            </p>
        </div>
    )
}
