import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ErrorList from '../components/ErrorList';
import { POSITIONS } from '../constants/positions';

function formatAmount(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function toDateInput(dateStr) {
  return dateStr ? dateStr.substring(0, 10) : '';
}

export default function PlayerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', nationality: '', position: '', dateOfBirth: '', clubId: '' });
  const [editErrors, setEditErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPlayer = () =>
    api.get(`/players/${id}`).then(data => {
      setPlayer(data.player);
      setTransfers(data.transfers ?? []);
    });

  useEffect(() => {
    Promise.all([api.get(`/players/${id}`), api.get('/clubs')])
      .then(([pd, cd]) => {
        setPlayer(pd.player);
        setTransfers(pd.transfers ?? []);
        setClubs(cd);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (editOpen && player) {
      setEditForm({
        firstName:   player.first_name,
        lastName:    player.last_name,
        nationality: player.nationality,
        position:    player.position,
        dateOfBirth: toDateInput(player.date_of_birth),
        clubId:      player.club_id ? String(player.club_id) : '',
      });
      setEditErrors([]);
    }
  }, [editOpen, player]);

  const handleEditChange = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditErrors([]);
    setSaving(true);
    try {
      await api.post(`/players/${id}/update`, { ...editForm, clubId: Number(editForm.clubId) });
      await fetchPlayer();
      setEditOpen(false);
    } catch (err) {
      setEditErrors(err.errors ?? [{ msg: err.message }]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${player.first_name} ${player.last_name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.post(`/players/${id}/delete`);
      navigate('/players');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!player) return <p>Player not found.</p>;

  return (
    <div>
      <p><Link to="/players">← Back to Players</Link></p>

      <h1>{player.first_name} {player.last_name}</h1>
      <p>{player.position} · {player.nationality}</p>
      <p>Date of birth: {player.date_of_birth ? formatDate(player.date_of_birth) : '—'}</p>
      <p>Current club: {player.club_name ?? 'None'}</p>

      {user && (
        <div>
          <button onClick={() => setEditOpen(true)}>Edit Player</button>
          {' '}
          <Link to={`/players/${id}/transfer`}>Record a Transfer</Link>
          {' '}
          <button onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Player'}
          </button>
        </div>
      )}
      {!user && (
        <p><Link to="/login">Log in</Link> to record a transfer.</p>
      )}

      <h2>Transfer History</h2>
      {transfers.length === 0 ? (
        <p>No transfers on record.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th><th>From</th><th>To</th><th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id}>
                <td>{formatDate(t.transferred_at)}</td>
                <td>{t.from_club_name ?? '—'}</td>
                <td>{t.to_club_name}</td>
                <td>{Number(t.amount) === 0 ? 'Free' : formatAmount(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Player">
        <ErrorList errors={editErrors} />
        <form onSubmit={handleEditSubmit}>
          <div>
            <label>First Name<br /><input name="firstName" value={editForm.firstName} onChange={handleEditChange} required /></label>
          </div>
          <div>
            <label>Last Name<br /><input name="lastName" value={editForm.lastName} onChange={handleEditChange} required /></label>
          </div>
          <div>
            <label>Nationality<br /><input name="nationality" value={editForm.nationality} onChange={handleEditChange} required /></label>
          </div>
          <div>
            <label>Position<br />
              <select name="position" value={editForm.position} onChange={handleEditChange} required>
                <option value="">— Select —</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label>Date of Birth<br /><input name="dateOfBirth" type="date" value={editForm.dateOfBirth} onChange={handleEditChange} required /></label>
          </div>
          <div>
            <label>Club<br />
              <select name="clubId" value={editForm.clubId} onChange={handleEditChange} required>
                <option value="">— Select a club —</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            {' '}
            <button type="button" onClick={() => setEditOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
