import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorList from '../components/ErrorList';
import { POSITIONS } from '../constants/positions';
import { useDebounce } from '../hooks/useDebounce';

export default function PlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', nationality: '', position: '', dateOfBirth: '', clubId: '' });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedNationality = useDebounce(nationalityFilter, 300);
  const [displayedPlayers, setDisplayedPlayers] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchPlayers = () =>
    api.get('/players').then(data => { setPlayers(data); setDisplayedPlayers(data); });

  useEffect(() => {
    Promise.all([api.get('/players'), api.get('/clubs')])
      .then(([pd, cd]) => { setPlayers(pd); setDisplayedPlayers(pd); setClubs(cd); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!debouncedSearch && !debouncedNationality) { setDisplayedPlayers(players); return; }
    setSearching(true);
    api.get(`/players/search?searchedName=${encodeURIComponent(debouncedSearch)}&nationality=${encodeURIComponent(debouncedNationality)}`)
      .then(data => setDisplayedPlayers(data))
      .finally(() => setSearching(false));
  }, [debouncedSearch, debouncedNationality, players]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await api.post('/players', { ...form, clubId: Number(form.clubId) });
      setForm({ firstName: '', lastName: '', nationality: '', position: '', dateOfBirth: '', clubId: '' });
      await fetchPlayers();
    } catch (err) {
      setErrors(err.errors ?? [{ msg: err.message }]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading players…</p>;

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='page-header'>Players</h1>

      <div className='flex gap-3 mb-6'>
        <input className="form-input flex-1" type="search" placeholder="Search by name…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        {' '}
        <input type="search" className="form-input flex-1" placeholder="Filter by nationality…" value={nationalityFilter} onChange={e => setNationalityFilter(e.target.value)} />
        {searching && <span className='text-gray-400 text-sm self-center'> Searching…</span>}
      </div>

      {displayedPlayers.length === 0 ? (
        <p className='text-gray-400 text-sm'>No players found.</p>
      ) : (
        <ul className='bg-gray-800 rounded-lg divide-y divide-gray-700 overflow-hidden'>
          {displayedPlayers.map(p => (
            <li key={p.id}>
              <Link to={`/players/${p.id}`} className='list-item-link'>{p.first_name} {p.last_name}
              <span className="text-gray-400 text-sm ml-2">
                {' — '}{p.position} · {p.nationality} · {p.club_name ?? 'No club'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <section>
          <h2 className='section-header'>Add a Player</h2>
          <ErrorList errors={errors} className='error-text'/>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
              <label className="form-label">First Name<br /><input className="form-input" name="firstName" value={form.firstName} onChange={handleChange} required /></label>
            </div>
            <div>
              <label className="form-label">Last Name<br /><input name="lastName" className="form-input" value={form.lastName} onChange={handleChange} required /></label>
            </div>
            <div>
              <label className="form-label">Nationality<br /><input name="nationality" className="form-input" value={form.nationality} onChange={handleChange} required /></label>
            </div>
            <div>
              <label className="form-label">Position<br />
                <select className="form-input" name="position" value={form.position} onChange={handleChange} required>
                  <option value="">— Select a position —</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
            </div>
            <div>
              <label className="form-label">Date of Birth<br /><input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required className="form-input" /></label>
            </div>
            <div>
              <label className="form-label">Club<br />
                <select name="clubId" value={form.clubId} onChange={handleChange} required className="form-input">
                  <option value="">— Select a club —</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <button className="btn-primary self-start" type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Player'}</button>
          </form>
        </section>
      ) : (
        <p className='login-prompt'><Link to="/login" className='login-link'>Log in</Link> to add a player.</p>
      )}
    </div>
  );
}
