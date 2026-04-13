import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailPage from './pages/ClubDetailPage';
import PlayersPage from './pages/PlayersPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import TransferPage from './pages/TransferPage';

function Layout() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login"                element={<LoginPage />} />
        <Route path="/signup"               element={<SignupPage />} />
        <Route path="/clubs"                element={<ClubsPage />} />
        <Route path="/clubs/:id"            element={<ClubDetailPage />} />
        <Route path="/players"              element={<PlayersPage />} />
        <Route path="/players/:id"          element={<PlayerDetailPage />} />
        <Route path="/players/:id/transfer" element={<TransferPage />} />
        <Route path="/"  element={<Navigate to="/clubs" replace />} />
        <Route path="*"  element={<Navigate to="/clubs" replace />} />
      </Route>
    </Routes>
  );
}
