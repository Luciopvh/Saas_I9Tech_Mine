import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tenants from './pages/Tenants'
import Endpoints from './pages/Endpoints'
import Jobs from './pages/Jobs'

function App() {
  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/endpoints" element={<Endpoints />} />
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </Box>
    </Layout>
  )
}

export default App
