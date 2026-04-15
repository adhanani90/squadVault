import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorList from '../components/ErrorList';
import { useDebounce } from '../hooks/useDebounce';

export default function ClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', country: '', stadium: '' });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedCountry = useDebounce(countryFilter, 300);
  const [displayedClubs, setDisplayedClubs] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchClubs = () =>
    api.get('/clubs').then(data => {
      setClubs(data);
      setDisplayedClubs(data);
    }).finally(() => setLoading(false));

  useEffect(() => { fetchClubs(); }, []);

  useEffect(() => {
    if (!debouncedSearch && !debouncedCountry) { setDisplayedClubs(clubs); return; }
    setSearching(true);
    api.get(`/clubs/search?searchedName=${encodeURIComponent(debouncedSearch)}&country=${encodeURIComponent(debouncedCountry)}`)
      .then(data => setDisplayedClubs(data))
      .finally(() => setSearching(false));
  }, [debouncedSearch, debouncedCountry, clubs]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await api.post('/clubs', form);
      setForm({ name: '', country: '', stadium: '' });
      setLoading(true);
      await fetchClubs();
    } catch (err) {
      setErrors(err.errors ?? [{ msg: err.message }]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading clubs…</p>;

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='page-header'>Clubs</h1>

      <div className='flex gap-3 mb-6'>
        <input type="search" placeholder="Search by name…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className='form-input flex-1' />
        {' '}
        <input className="form-input flex-1" type="search" placeholder="Filter by country…" value={countryFilter} onChange={e => setCountryFilter(e.target.value)} />
        {searching && <span> Searching…</span>}
      </div>

      {displayedClubs.length === 0 ? (
        <p className="text-gray-400 text-sm" >No clubs found.</p>
      ) : (
        <ul className='bg-gray-800 rounded-lg overflow-hidden divide-y divide-gray-700'>
          {displayedClubs.map(club => (
            <li key={club.id}>
              <Link to={`/clubs/${club.id}`} className='list-item-link'>{club.name}
              <span className='text-gray-400 text-sm ml-2'>{'— '}{club.country} · {club.stadium}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <section>
          <h2 className='section-header'>Add a Club</h2>
          <ErrorList errors={errors} className="error-text" />
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
              <label className='form-label'>Name<br /><input name="name" className="form-input" value={form.name} onChange={handleChange} required /></label>
            </div>
            <div>
              <label className='form-label'>Country<br /><input className='form-input' name="country" value={form.country} onChange={handleChange} required /></label>
            </div>
            <div>
              <label className='form-label'>Stadium<br /><input className='form-input' name="stadium" value={form.stadium} onChange={handleChange} required /></label>
            </div>
            <button className='btn-primary self-start' type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Club'}</button>
          </form>
        </section>
      ) : (
        <p className='login-prompt'><Link to="/login" className='login-link'>Log in</Link> to add a club.</p>
      )}
    </div>
  );
}
