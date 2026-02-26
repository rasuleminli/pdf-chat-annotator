import './App.css'

import { Chat } from './components/chat'
import { PdfViewer } from './components/pdf-viewer'

function App() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PdfViewer />
            <Chat />
        </div>
    )
}

export default App
