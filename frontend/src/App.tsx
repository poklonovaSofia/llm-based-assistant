// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Navbar} from './components/Navbar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import SignIn from './pages/SignIn';
import CreateAccount from './pages/CreateAccount';
import CreateAgent from './pages/CreateAgent';
import UploadDocuments from './pages/UploadDocuments';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f8f1e9] font-serif">
        <Navbar />

        <Routes>
          {/* Головна сторінка */}
          <Route path="/" element={<Home />} />

          {/* Сторінка чату (коли клікаєш на картку агента) */}
          <Route path="/chat/:agentId" element={<Chat />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/create-agent" element={<CreateAgent />} />
          <Route path="/upload/:agentId" element={<UploadDocuments />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;