import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-6">
        <Link to="/clubs" className="text-xl font-bold tracking-wide hover:text-blue-400 transition-colors">
          SquadVault
        </Link>
        <Link to="/clubs" className="nav-link">Clubs</Link>
        <Link to="/players" className="nav-link">Players</Link>
      </div>

      <div className="flex items-center gap-4">
        {user === undefined ? null : user ? (
          <>
            <span className='text-gray-400 text-sm'>{user.email}</span>
            <button onClick={handleLogout} className='btn-danger'>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className='nav-link'>Log in</Link>
            <Link to="/signup" className='btn-primary'>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}