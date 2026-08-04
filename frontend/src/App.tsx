import { useEffect, useState } from 'react';
import logo from './assets/logo.svg';
import './App.css';

interface User {
  id: number;
  username: string;
  name: string;
}

function App() {
  const [message, setMessage] = useState('Connexion au backend...');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL)
      .then((res) => res.text())
      .then(setMessage)
      .catch(() => setMessage('Impossible de joindre le backend.'));

    fetch(`${import.meta.env.VITE_API_URL}/users`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  return (
    <main className="hello">
      <img
        src={logo}
        className="logo"
        alt="KcalApp logo"
        width={48}
        height={48}
      />
      <h1>Hello, KcalApp</h1>
      <p>{message}</p>
      {users.map((user) => (
        <p key={user.id}>
          {user.username} — {user.name}
        </p>
      ))}
    </main>
  );
}

export default App;
