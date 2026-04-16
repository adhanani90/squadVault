import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ErrorList from '../components/ErrorList';

export default function ClubDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', country: '', stadium: '' });
  const [editErrors, setEditErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchClub = () =>
    api.get(`/clubs/${id}`)
      .then(data => { setClub(data.club); setPlayers(data.players ?? []); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => { fetchClub(); }, [id]);

  useEffect(() => {
    if (editOpen && club) {
      setEditForm({ name: club.name, country: club.country, stadium: club.stadium });
      setEditErrors([]);
    }
  }, [editOpen, club]);

  const handleEditChange = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditErrors([]);
    setSaving(true);
    try {
      await api.post(`/clubs/${id}/update`, editForm);
      await fetchClub();
      setEditOpen(false);
    } catch (err) {
      setEditErrors(err.errors ?? [{ msg: err.message }]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${club.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.post(`/clubs/${id}/delete`);
      navigate('/clubs');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!club)   return <p>Club not found.</p>;

  return (
    <div className='page-container'>
      <p><Link className='back-link' to="/clubs">← Back to Clubs</Link></p>

      <h1 className='page-header'>{club.name}</h1>
      <p className='detail-subtitle'>{club.country} · {club.stadium}</p>

      {user && (
        <div>
          <button onClick={() => setEditOpen(true)} className='btn-primary'>Edit Club</button>
          {' '}
          <button onClick={handleDelete} disabled={deleting} className='btn-danger'>
            {deleting ? 'Deleting…' : 'Delete Club'}
          </button>
        </div>
      )}

      <h2 className='section-header'>Players</h2>
      {players.length === 0 ? (
        <p className='text-gray-400 text-sm'>No players registered for this club.</p>
      ) : (
        <ul className='list-container'>
          {players.map(p => (
            <li key={p.id}>
              <Link to={`/players/${p.id}`} className='list-item-link'>{p.first_name} {p.last_name}
              <span className='text-gray-400 text-sm ml-2'>  
                  {' — '}{p.position} · {p.nationality}
                </span> 
              </Link>
            </li>
          ))}
        </ul>
      )}

    <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Club" >
      <ErrorList errors={editErrors} />
      <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
        <div>
          <label className="form-label">Name<br /><input className="form-input" name="name" value={editForm.name} onChange={handleEditChange} required /></label>
        </div>
        <div><label className="form-label">Country<br /><input className="form-input" name="country" value={editForm.country} onChange={handleEditChange} required /></label>
        </div>
        <div><label className="form-label">Stadium<br /><input className="form-input" name="stadium" value={editForm.stadium} onChange={handleEditChange} required /></label>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
    </div>
  );
}
