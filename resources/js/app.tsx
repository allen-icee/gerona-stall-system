import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold text-blue-600">
                Gerona Stall System 🚀
            </h1>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)