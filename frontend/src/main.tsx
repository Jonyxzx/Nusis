import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import App from '@/App'
import { AuthProvider } from '@/lib/auth'
import { EmailLogsProvider } from '@/lib/emailLogs'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <EmailLogsProvider>
        <App />
      </EmailLogsProvider>
    </AuthProvider>
  </StrictMode>
)
