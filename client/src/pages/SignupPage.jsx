import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div>
      <h1>SquadVault</h1>
      <h2>Create an account</h2>

      {errors.length > 0 && (
        <ul>
          {errors.map((e, i) => <li key={i}>{e.msg}</li>)}
        </ul>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Confirm Password
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
        </label>
        <label>
          Age
          <input type="number" name="age" value={form.age} onChange={handleChange} min="18" max="120" required />
        </label>
        <label>
          Bio
          <textarea name="bio" value={form.bio} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
