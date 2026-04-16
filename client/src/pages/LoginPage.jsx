import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorList from '../components/ErrorList';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setErrors(err.errors ?? [{ msg: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='page-container'>
      <h1 className="page-header">SquadVault</h1>
      <h2 className="section-header">Log in</h2>

      <ErrorList errors={errors} />

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <label className='form-label'>
          Email
          <input className='form-input' type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label className='form-label'>
          Password
          <input className='form-input' type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading} className='btn-primary'>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className='login-prompt'>No account? <Link to="/signup" className='login-link'>Sign up</Link></p>
    </div>
  );
}
