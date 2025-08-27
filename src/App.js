import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Home from './components/Home';
import Signup from './components/Signup';
import Signin from './components/Signin';
import AddSkill from './components/Addskill';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Skills from './components/Skills';
import Profile from './components/Profile';
import ProtectedRoute from './context/ProtectedRoute';  // ⬅️ import
import 'bootstrap/dist/css/bootstrap.min.css';
import Messages from "./components/chat";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          {/* <Navbar /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/messages/:receiverId" element={<Messages />} />
            <Route 
              path="/addskills" 
              element={
                <ProtectedRoute>
                  <AddSkill />
                </ProtectedRoute>
              } 
            />
            <Route path="/skills" element={<Skills />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
