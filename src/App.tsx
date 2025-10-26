import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './views/Home'
import Login from './views/Login'
import Register from './views/Register'
import Landing from './views/Landing'
import ProtectedRoute from './routes/ProtectedRoute'

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
    </Routes>
  )
}

export default App
