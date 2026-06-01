import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="page">
      <nav className="nav" aria-label="Hoofdnavigatie">
        <a className="brand" href="/">
          Plymouth
        </a>
        <div className="navLinks">
          <a href="#over">Over</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero">
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
