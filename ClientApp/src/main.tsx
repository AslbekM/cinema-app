import React from 'react'
import ReactDOM from 'react-dom/client'
// Bootstrap (layout/grid/utilities) — bundled locally so the app works offline.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Inter Tight — the Paymark template typeface, bundled locally.
import '@fontsource/inter-tight/300.css'
import '@fontsource/inter-tight/400.css'
import '@fontsource/inter-tight/500.css'
import '@fontsource/inter-tight/600.css'
import '@fontsource/inter-tight/700.css'
import '@fontsource/inter-tight/800.css'
import App from './App'
// Our theme — imported last so it overrides Bootstrap.
import './theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
