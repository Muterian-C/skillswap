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
import { NotificationProvider } from './context/NotificationContext';
import Conversations from "./components/Conversations";
import EditSkill from './components/EditSkill';
import CreatePost from './components/CreatePost';
import PostsFeed from "./components/PostFeed";
import PostPage from "./components/PostPage";
import SingleSkill from './components/SingleSkill';
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import GoogleCallback from "./components/GoogleCallback";


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div>
            {/* <Navbar /> */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/messages/:receiverId" element={<Messages />} />
              <Route path="/posts" element={<PostsFeed />} />
              <Route path="/post/:id" element={<PostPage />} /> {/* Add this route */}
              <Route path="/skill/:id" element={<SingleSkill />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/createpost"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/addskills"
                element={
                  <ProtectedRoute>
                    <AddSkill />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-skill/:id"
                element={
                  <ProtectedRoute>
                    <EditSkill />
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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
