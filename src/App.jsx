import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './frontend/NavBar'
import Stock from './frontend/Stock'
import Productos from './frontend/Productos'
import Ventas from './frontend/Ventas'
import { stockAPI } from './services/api'

function App() {
  const [currentView, setCurrentView] = useState('stock')
  
  // Estado compartido del stock
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar stock desde la API al montar el componente
  useEffect(() => {
    loadStock()
  }, [])

  const loadStock = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await stockAPI.getAll()
      setStockItems(data)
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar stock:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderView = () => {
    if (loading) {
      return <div className="loading">Cargando datos...</div>
    }

    if (error) {
      return (
        <div className="error-container">
          <h3>Error al cargar los datos</h3>
          <p>{error}</p>
          <button onClick={loadStock}>Reintentar</button>
        </div>
      )
    }

    switch(currentView) {
      case 'stock':
        return <Stock stockItems={stockItems} setStockItems={setStockItems} reloadStock={loadStock} />
      case 'productos':
        return <Productos stockItems={stockItems} setStockItems={setStockItems} reloadStock={loadStock} />
      case 'ventas':
        return <Ventas />
      default:
        return <Stock stockItems={stockItems} setStockItems={setStockItems} reloadStock={loadStock} />
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
