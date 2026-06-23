import { Routes, Route, Navigate } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'
import ErrorPage from './pages/ErrorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/processing" element={<ProcessingPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
