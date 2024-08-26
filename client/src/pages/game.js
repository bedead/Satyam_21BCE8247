'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

let socket;

const initialBoard = [
    ['p1', 'p2', 'p3', 'h1', 'h2'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['p1', 'p2', 'p3', 'h1', 'h2'],
];

const Game = () => {
    const [status, setStatus] = useState('');
    const [players, setPlayers] = useState(2);
    const [currentTurn, setCurrentTurn] = useState('');
    const [myTurn, setMyTurn] = useState(false);
    const [board, setBoard] = useState(initialBoard);
    const [opponentUsername, setOpponentUsername] = useState('');
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        socket = io('http://localhost:5000', {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('get_player_data', { room: 12 });
        });

        socket.on('game_data', (data) => {
            // Ensure username is set before processing the game data
            console.log("here");
            const playerUsername = username || data.player_usernames.find(user => user === username);
            setUsername(playerUsername);

            const opponent = data.player_usernames.find(user => user !== playerUsername);
            setOpponentUsername(opponent);

            setCurrentTurn(data.current_turn);
            setMyTurn(data.current_turn === playerUsername);

            if (data.current_turn === undefined) {
                setStatus('Waiting for opponent to join or make a move...');
            } else {
                setStatus(data.current_turn === playerUsername ? "It's your turn" : `It's ${data.current_turn}'s turn`);
            }

            console.log(username);
            console.log(opponentUsername);
        });

        socket.on('move_made', (data) => {
            setStatus(`${data.player} made a move: ${data.move}`);
            setCurrentTurn(data.current_turn);
            setMyTurn(data.current_turn === username);
            setBoard(data.updated_board);
        });

        socket.on('player_disconnected', (data) => {
            setStatus(data.message);
            setPlayers(data.players_left);

            if (data.players_left < 2) {
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        });

        socket.on('disconnect', () => {
            setStatus('Disconnected from server.');
        });

        return () => {
            socket.off('game_data');
            socket.off('move_made');
            socket.off('player_disconnected');
            socket.disconnect();
        };
    }, [username]); // Ensure useEffect runs when username changes

    const handleMove = (row, col) => {
        if (!myTurn) {
            setStatus(`It's ${opponentUsername}'s turn.`);
            return;
        }

        // Implement the move logic here
        socket.emit('player_move', {
            player: username,
            move: { row, col },
            updated_board: board,
        });

        setStatus('Move has been made. Waiting for opponent...');
    };

    const handleDisconnect = () => {
        socket.emit('player_disconnect', {});
        setStatus('You have disconnected.');
        router.push('/');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Game Interface</h1>
            <p>Players in the game: {players}</p>
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
