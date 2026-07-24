import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { matchLocaleSlug, localeToUrlPrefix } from './i18n/registry'

// Detect locale from the URL prefix (e.g. /ja, /ko). React Router runs
// with the prefix as basename so child routes match the canonical English
// path shape, and every internal <Link> automatically inherits the prefix.
const firstSeg = window.location.pathname.split('/')[1] ?? '';
const matched = matchLocaleSlug(firstSeg);
const basename = matched && matched !== 'en' ? localeToUrlPrefix(matched) : '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App basename={basename} />
  </StrictMode>,
)
