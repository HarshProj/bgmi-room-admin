import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Components/Home';
import { Navbar } from './Components/Navbar';
import { CreateRoom } from './Components/CreateRoom';
import { Profile } from './Components/Profile';
import { Login } from './Components/Login';
import { Dashboard } from './Components/Dashboard';
function App() {
  return (
    <>
    <Router>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
