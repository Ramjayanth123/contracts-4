import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './server' // Import the server to set up API handlers
import initializeServices from './services/initServices'

// Initialize application services
initializeServices()
  .then(() => console.log('Services initialized successfully'))
  .catch(error => console.error('Failed to initialize services:', error));

createRoot(document.getElementById("root")!).render(<App />);
