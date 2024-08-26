import random
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import eventlet
from game_logic import get_possible_moves

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
    username = data["username"]

    if room not in game_rooms:
        game_rooms[room] = {
            "players": 1,
            "player_usernames": [],
            "current_turn": username,
            f"{username}": "A",
            "more": {},
        }
    else:
        game_rooms[room]["players"] = game_rooms[room]["players"] + 1
        game_rooms[room][f"{username}"] = "B"

    # addd usernames to room_data
    game_rooms[room]["player_usernames"].append(username)

    join_room(room)

    print(f"{username} has joined game.")
    print("PLayers in room: ", game_rooms[room]["players"])

    print(game_rooms[room]["current_turn"])

    if game_rooms[room]["players"] == 2:
        emit(
            "start_game",
            {"game_room": game_rooms[room], "data": "Both players have joined."},
            to=room,
        )
        print(f"Starting game.")
        # emit(
        #     "room_data",
        #     {"game_room": game_rooms[room], "message": "Room data received."},
        #     room=room,
        # )
        # print("called")
    elif game_rooms[room]["players"] == 1:
        emit(
            "waiting",
            {"data": "Waiting for second players to join."},
            to=room,
        )
        print(f"Waiting for player.")
    elif game_rooms[room]["players"] > 2:
        emit(
            "error",
            {"data": "more than 2 players have joined the room. \nRestart server."},
        )


@socketio.on("get_room_data")
def handle_get_room_data(data):
    global game_rooms

    room = data.get("room")  # Use .get() to safely retrieve "room"
    if room in game_rooms:
        cur_data = game_rooms[room]
        print(f"Room {room} data: {cur_data}")  # Debugging
        emit(
            "room_data",
            {"game_room": cur_data, "message": "Room data received."},
            to=room,
        )
    else:
        print(f"Room {room} not found.")
        emit("room_data", {"game_room": None, "message": "Room not found."}, to=room)


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
            to=room,
        )


@socketio.on("player_disconnect")
def handle_player_disconnect(data):
    global game_rooms

    room = data["room"]
    username = data["username"]

    leave_room(room)

    print(f"{username} is disconnected.")

    if game_rooms[room]["players"] == 0:
        del game_rooms[room]  # Clean up the room if empty
    else:
        game_rooms[room]["players"] = game_rooms[room]["players"] - 1
        print("PLayers in room: ", game_rooms[room]["players"])

        emit(
            "player_disconnected",
            {
                "cur_data": game_rooms[room],
                "message": "A player has disconnected.",
            },
            to=room,
        )


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
