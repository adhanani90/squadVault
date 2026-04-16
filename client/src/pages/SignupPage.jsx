import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorList from '../components/ErrorList';


export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', age: '', bio: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await signup({ ...form, age: Number(form.age) });
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
      <h2 className="section-header">Sign Up</h2>


      <ErrorList errors={errors}/>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <label className='form-label'>
          Email
          <input className='form-input' type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label className='form-label'>
          Password
          <input className='form-input' type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label className='form-label'>
          Confirm Password
          <input className='form-input' type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
        </label>
        <label className='form-label'>
          Age
          <input className='form-input' type="number" name="age" value={form.age} onChange={handleChange} min="18" max="120" required />
        </label>
        <label className='form-label'>
          Bio
          <textarea rows={4} className='form-input' name="bio" value={form.bio} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading} className='btn-primary'>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className='login-prompt'>Already have an account? <Link to="/login" className="login-link">Log in</Link></p>
    </div>
  );
}
