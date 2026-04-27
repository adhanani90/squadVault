import { useState, useEffect } from 'react';
import { api } from '../api/client';
import ErrorList from '../components/ErrorList';
import { useAuth } from '../context/AuthContext';

export default function Standings() {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const { user } = useAuth();

    const fetchStandings = () =>
        api.get('/league/standings').then(data => setStandings(data)).finally(() => setLoading(false));

    const syncStandings = () =>
        api.post('/league/sync').then(()=>fetchStandings());

    useEffect(() => {
        fetchStandings();
    }, []);

    if (loading) return <p>Loading standings…</p>;

    return (
        <div className='page-container'>
            <h1 className='page-header'>Standings</h1>

            <ErrorList errors={errors} />

            <table className="table">
                <thead >
                    <tr >
                        <th>Position</th>
                        <th>Club</th>
                        <th>Played</th>
                        <th>Won</th>
                        <th>Drawn</th>
                        <th>Lost</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map(team => (
                        <tr key={team.id}>
                        <td>{team.position}</td>
                        <td>{team.team_name}</td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.drawn}</td>
                        <td>{team.lost}</td>
                        <td>{team.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/*Conditionally render the buttons based on user status and standings length*/}
            {user ? <button onClick={syncStandings} className='btn-primary'>Sync standings</button> : null}
            {standings.length > 0 ? <p>Last updated: {new Date(standings[0]?.synced_at).toLocaleDateString()}</p> : <p>Last updated: Never updated</p>}
        </div>
    );
}   