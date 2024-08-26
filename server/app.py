import random
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import eventlet
from game_logic import get_possible_moves, generate_random_username

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

game_rooms = {}

@app.route("/")
def index():
    return "Server is running"


@socketio.on("get_possible_moves")
def handle_get_possible_moves(data):
    row = data["rowIndex"]
    col = data["colIndex"]
    piece = data["piece"]

    # Get the possible moves based on the piece and its position
    moves = get_possible_moves(piece, row, col)
    print(moves)

    # Emit the possible moves back to the client
    emit("possible_moves", {"moves": moves})


@socketio.on("join_game")
def handle_join_game(data):
    global game_rooms

    room = data["room"]
    username = generate_random_username()

    if room not in game_rooms:
        game_rooms[room] = {
            "players": 0,
            "player_usernames": [],
            "current_turn": None,
        }

    game_state = game_rooms[room]
    game_state["player_usernames"].append(username)
    game_state["players"] += 1

    join_room(room)

    if game_state["players"] == 2:
        game_state["current_turn"] = game_state["player_usernames"][0]
        emit(
            "start_game",
            {
                "data": "Both players have joined the game. Redirecting to the game interface...",
                "player_usernames": game_state["player_usernames"],
                "current_turn": game_state["current_turn"],
            },
            room=room,
        )
    elif game_state["players"] == 1:
        emit(
            "waiting",
            {
                "data": f"Waiting for the second player to join... Your username is {username}"
            },
            room=room,
        )


@socketio.on("player_move")
def handle_player_move(data):
    global game_rooms

    room = data["room"]
    current_player = data["player"]
    move = data["move"]

    game_state = game_rooms.get(room)
    if not game_state:
        emit("error", {"message": "Game room not found."})
        return

    if current_player == game_state["current_turn"]:
        # Toggle the current turn to the other player
        game_state["current_turn"] = (
            game_state["player_usernames"][1]
            if game_state["current_turn"] == game_state["player_usernames"][0]
            else game_state["player_usernames"][0]
        )
        emit(
            "move_made",
            {
                "player": current_player,
                "move": move,
                "current_turn": game_state["current_turn"],
                "updated_board": data["updated_board"],
            },
            room=room,
        )


@socketio.on("get_player_data")
def handle_get_player_data(data):
    global game_rooms

    room = data["room"]
    game_state = game_rooms.get(room)

    if not game_state:
        emit("error", {"message": "Game room not found."})
        return

    emit(
        "game_data",
        {
            "current_turn": game_state["current_turn"],
            "player_usernames": game_state["player_usernames"],
        },
        room=room,
    )
    print("called")


@socketio.on("player_disconnect")
def handle_player_disconnect(data):
    room = data["room"]
    game_state = game_rooms.get(room)

    if not game_state:
        return

    leave_room(room)
    game_state["players"] -= 1

    if game_state["players"] == 0:
        del game_rooms[room]  # Clean up the room if empty
    else:
        emit(
            "player_disconnected",
            {
                "message": "A player has disconnected.",
                "players_left": game_state["players"],
            },
            room=room,
        )


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
