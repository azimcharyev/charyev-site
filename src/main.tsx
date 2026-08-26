import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { startPreloader } from './preloader';
/* Ради побочного действия: вешает на <html> класс is-scrolling, по которому
   замирает кольцо на плитках кейсов. Подробности — в самом модуле. */
import './hooks/scrollActivity';

import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/preloader.css';
import './styles/hero.css';
import './styles/services.css';
import './styles/cases.css';
import './styles/footer.css';
import './styles/case-detail.css';
import './styles/responsive.css';

/* До разметки приложения: прелоадер уже на экране, и чем раньше он начнёт
   считать, тем меньше висит на нуле. */
startPreloader();

const container = document.getElementById('root');
if (!container) throw new Error('Не найден #root');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
