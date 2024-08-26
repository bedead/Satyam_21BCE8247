'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import generateRandomUsername from './util';

let socket;

const StartGame = () => {
    const [message, setMessage] = useState('Click "Start Game" to join.');
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const router = useRouter();

    useEffect(() => {
        const savedUsername = sessionStorage.getItem('username');
        if (savedUsername == "" | savedUsername == null) {
            sessionStorage.setItem('username', generateRandomUsername());
            setUsername(sessionStorage.getItem("username"));
            console.log(username);

        } else {
            setUsername(savedUsername);
            sessionStorage.setItem('username', savedUsername);
        }

        socket = io('http://localhost:5000', {
            reconnectionAttempts: 5, // Retry connection attempts
            timeout: 10000, // Timeout after 10 seconds
        });

        socket.on('error', (data) => {
            setMessage(data.data);
            setLoading(false);
            console.log(data.data);
        });

        socket.on('waiting', (data) => {
            setMessage(data.data);
            setUsername(sessionStorage.getItem("username"));
            // Save the username received from the server
            console.log(username);
            setLoading(false);
        });

        socket.on('start_game', (data) => {
            console.log(data);

            setMessage(data);
            console.log(data.game_room);
            setUsername(sessionStorage.getItem('username'));

            setLoading(false);
            setTimeout(() => {
                router.push('/game');
            }, 1000);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleStartGame = () => {
        if (!joined) {
            setLoading(true);
            socket.emit('join_game', { room: 12, username: username }); // Consider dynamically setting room ID
            setJoined(true);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to the Turn-Based Chess-like Game</h1>
            <p>Only 2 players can start the game at a time.</p>
            <button
                onClick={handleStartGame}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                }}
                disabled={joined || loading}
            >
                {loading ? 'Waiting...' : 'Start Game'}
            </button>
            <p>{message}  Your username {username}</p>
        </div>
    );
};

export default StartGame;
