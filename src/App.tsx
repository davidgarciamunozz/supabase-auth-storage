import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './views/Home'
import Login from './views/Login'
import Register from './views/Register'
import Landing from './views/Landing'
import AdminDashboard from './views/AdminDashboard'
import PacienteDashboard from './views/PacienteDashboard'
import EspecialistaDashboard from './views/EspecialistaDashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleProtectedRoute from './routes/RoleProtectedRoute'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Landing/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route
        path='/home'
        element={(
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )}
      />
      <Route
        path='/admin'
        element={(
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleProtectedRoute>
        )}
      />
      <Route
        path='/paciente'
        element={(
          <RoleProtectedRoute allowedRoles={['paciente']}>
            <PacienteDashboard />
          </RoleProtectedRoute>
        )}
      />
      <Route
        path='/especialista'
        element={(
          <RoleProtectedRoute allowedRoles={['especialista']}>
            <EspecialistaDashboard />
          </RoleProtectedRoute>
        )}
      />
    </Routes>
  )
}

export default App
