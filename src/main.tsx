import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';
import App from './App';
import './components/store/index.css';

// Add mouse tracking for dynamic background
const updateMousePosition = (e: MouseEvent) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  document.documentElement.style.setProperty('--mouse-x', `${x}%`);
  document.documentElement.style.setProperty('--mouse-y', `${y}%`);
};

document.addEventListener('mousemove', updateMousePosition);

const routes = createRoutesFromElements(
  <Route path="*" element={<App />} />
);

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
);
