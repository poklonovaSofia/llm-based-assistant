// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Navbar} from './components/Navbar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import SignIn from './pages/SignIn';
import CreateAccount from './pages/CreateAccount';
import CreateAgent from './pages/CreateAgent';
import UploadDocuments from './pages/UploadDocuments';
import MyAgents from './pages/MyAgents';
import AgentDetails from './pages/AgentDetails';
import { ProtectedRoute } from './components/ProtectedRoute';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 font-serif">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/create-account" element={<CreateAccount />} />
          
          <Route path="/chat/:agentId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
          <Route path="/upload/:agentId" element={<ProtectedRoute><UploadDocuments /></ProtectedRoute>} />
          <Route path="/my-agents" element={<ProtectedRoute><MyAgents /></ProtectedRoute>} />
          <Route path="/agent/:agentId" element={<ProtectedRoute><AgentDetails /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;