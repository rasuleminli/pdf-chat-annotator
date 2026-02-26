import './App.css'

import { ChatWindow } from './components/chat-window'
import { PdfViewer } from './components/pdf-viewer'

function App() {
    return (
        <div className="flex flex-col lg:flex-row w-full items-start gap-5">
            <PdfViewer />
            <ChatWindow />
        </div>
    )
}

export default App
