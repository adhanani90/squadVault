import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorList from '../components/ErrorList';

export default function TransferPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [player, setPlayer] = useState(null);
  const [form, setForm] = useState({ fromClubId: '', toClubId: '', amount: '', date: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/players/${id}`), api.get('/clubs')])
      .then(([pd, cd]) => {
        const p = pd.player;
        setPlayer(p);
        setClubs(cd);
        setForm(f => ({ ...f, fromClubId: p.club_id ? String(p.club_id) : '' }));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await api.post(`/players/${id}/transfer`, {
        fromClubId: Number(form.fromClubId),
        toClubId:   Number(form.toClubId),
        amount:     Number(form.amount),
        date:       form.date || undefined,
      });
      navigate(`/players/${id}`);
    } catch (err) {
      setErrors(err.errors ?? [{ msg: err.message }]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  if (!user) return <p className='login-prompt'><Link className='login-link' to="/login">Log in</Link> to record a transfer.</p>;

  return (
    <div className='page-container'>
      <p ><Link to={`/players/${id}`} className='back-link'>← Back to Player</Link></p>

      <h1 className='page-header'>Record Transfer{player ? ` — ${player.first_name} ${player.last_name}` : ''}</h1>

      <ErrorList errors={errors} className='error-text'/>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <label className='form-label'>From Club<br />
            <select name="fromClubId" value={form.fromClubId} onChange={handleChange} required className='form-input'>
              <option value="">— Select source club —</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label className='form-label'>To Club<br />
            <select name="toClubId" value={form.toClubId} onChange={handleChange} required className='form-input'>
              <option value="">— Select destination club —</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label className='form-label'>Fee (£)<br />
            <input className='form-input' name="amount" type="number" min="0" step="0.01" placeholder="0 for free transfer" value={form.amount} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label className='form-label'>Date<br />
            <input name="date" type="date" value={form.date} onChange={handleChange} className='form-input'/>
          </label>
        </div>
        <div className="flex gap-3">
          <button className='btn-primary' type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Record Transfer'}</button>
              <Link to={`/players/${id}`} className="btn-secondary ">Cancel</Link>
        </div>
        {' '}
      </form>
    </div>
  );
}
