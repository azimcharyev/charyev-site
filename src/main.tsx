import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/services.css';
import './styles/cases.css';
import './styles/footer.css';
import './styles/case-detail.css';
import './styles/responsive.css';

const container = document.getElementById('root');
if (!container) throw new Error('Не найден #root');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
