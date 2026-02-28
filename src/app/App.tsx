import { ChatWindow } from '../features/chat-window/components/chat-window'
import { PdfViewer } from '../features/pdf-viewer/components/pdf-viewer'
import { RealtimeCursors } from '../features/realtime-cursors/components/realtime-cursors'
import { Providers } from './providers'

function App() {
    return (
        <Providers>
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-start gap-5">
                <PdfViewer />
                <ChatWindow />
                <RealtimeCursors />
            </div>
        </Providers>
    )
}

export default App
