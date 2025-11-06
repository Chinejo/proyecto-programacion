import './Navbar.css';

function Navbar({ currentView, setCurrentView }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Panadería</h1>
      </div>
      <div className="navbar-menu">
        <button 
          className={`nav-button ${currentView === 'stock' ? 'active' : ''}`}
          onClick={() => setCurrentView('stock')}
        >
          Stock
        </button>
        <button 
          className={`nav-button ${currentView === 'productos' ? 'active' : ''}`}
          onClick={() => setCurrentView('productos')}
        >
          Productos
        </button>
        <button 
          className={`nav-button ${currentView === 'ventas' ? 'active' : ''}`}
          onClick={() => setCurrentView('ventas')}
        >
          Ventas
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
