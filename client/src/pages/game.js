'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

let socket;

const initialBoard = [
    ['A-p1', 'A-p2', 'A-p3', 'A-h1', 'A-h2'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['B-p1', 'B-p2', 'B-p3', 'B-h1', 'B-h2'],
];

const Game = () => {
    const [status, setStatus] = useState('');
    const [currentTurn, setCurrentTurn] = useState('');
    const [players, setPlayers] = useState();
    const [myTurn, setMyTurn] = useState(false);
    const [board, setBoard] = useState(initialBoard);
    const [opponentUsername, setOpponentUsername] = useState('');
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const savedUsername = sessionStorage.getItem('username');
        setUsername(savedUsername);

        socket = io('http://localhost:5000', {
            reconnectionAttempts: 5, // Retry connection attempts
            timeout: 10000, // Timeout after 10 seconds
        });

        socket.emit('get_room_data', { room: 12 });
        console.log("called");

        socket.on('room_data', (data) => {
            console.log('Room data received:', data.game_room);
            // sessionStorage.setItem("room_data", data.game_room);

            if (data.game_room) {
                // setStatus(data.message);
                // console.log(data.message);

                // // Handle the game room data
                // const playerUsername = username || data.game_room.player_usernames.find(user => user === username);
                // setUsername(playerUsername);
                // sessionStorage.setItem('username', playerUsername);

                // const opponent = data.game_room.player_usernames.find(user => user !== playerUsername);
                // setOpponentUsername(opponent);

                // setCurrentTurn(data.game_room.current_turn);
                // setMyTurn(data.game_room.current_turn === playerUsername);

                // if (!data.game_room.current_turn) {
                //     setStatus('Waiting for opponent to join or make a move...');
                // } else {
                //     setStatus(data.game_room.current_turn === playerUsername ? "It's your turn" : `It's ${data.game_room.current_turn}'s turn`);
                // }
            } else {
                console.log('No game_room data received');
                setStatus('Room not found.');
            }
        });

        socket.on('move_made', (data) => {
            // Handle move made event
        });

        socket.on('player_disconnected', (data) => {
            setStatus(data.message);
            setPlayers(data.cur_data.players);

            if (data.cur_data.players < 2) {
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleMove = (row, col) => {
        if (!myTurn) {
            setStatus(`It's ${opponentUsername}'s turn.`);
            return;
        }

        socket.emit('player_move', {
            player: username,
            move: { row, col },
            updated_board: board,
        });

        setStatus('Move has been made. Waiting for opponent...');
    };

    const handleDisconnect = () => {
        socket.emit('player_disconnect', { room: 12, username: username });
        setStatus('You have disconnected.');
        sessionStorage.clear(); // Remove username from localStorage
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Game Interface</h1>
            <p>Your username is {username}</p>
            <p>{status}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gap: '5px', justifyContent: 'center' }}>
                {board.map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                        <button
                            key={`${rowIndex}-${colIndex}`}
                            type='button'
                            onClick={() => handleMove(rowIndex, colIndex)}
                            style={{
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ddd',
                                cursor: myTurn ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold',
                            }}
                        >
                            {cell || ''}
                        </button>
                    ))
                ))}
            </div>
            <button
                onClick={handleDisconnect}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#f50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    marginTop: '20px',
                }}
            >
                Disconnect
            </button>
        </div>
    );
};

export default Game;
