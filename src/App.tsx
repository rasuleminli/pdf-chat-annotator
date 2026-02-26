import './App.css'

import { ChatWindow } from './components/chat-window'
import { PdfViewer } from './components/pdf-viewer'

function App() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PdfViewer />
            <ChatWindow />
        </div>
    )
}

export default App
