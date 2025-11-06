import { useState } from 'react'
import './App.css'
import Navbar from './frontend/Navbar'
import Stock from './frontend/Stock'
import Productos from './frontend/Productos'
import Ventas from './frontend/Ventas'

function App() {
  const [currentView, setCurrentView] = useState('stock')

  const renderView = () => {
    switch(currentView) {
      case 'stock':
        return <Stock />
      case 'productos':
        return <Productos />
      case 'ventas':
        return <Ventas />
      default:
        return <Stock />
    }
  }

  return (
    <div className="app">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

export default App
