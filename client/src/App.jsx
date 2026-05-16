import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom';
import CalendarPage from './components/CalendarPage.jsx';
import ChoresPage from './components/ChoresPage.jsx';
import MembersPage from './components/MembersPage.jsx';

function Nav() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded font-medium text-sm transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;
  return (
    <nav className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
      <span className="font-bold text-lg text-gray-800 mr-4">Office Chores</span>
      <NavLink to="/" end className={linkClass}>Calendar</NavLink>
      <NavLink to="/chores" className={linkClass}>Chores</NavLink>
      <NavLink to="/members" className={linkClass}>Team</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Nav />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/chores" element={<ChoresPage />} />
            <Route path="/members" element={<MembersPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
