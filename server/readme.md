# Turn-Based Game Server

This project is the server-side implementation of a turn-based multiplayer game using Flask and Socket.IO. The server handles game logic, player management, and real-time communication between clients.


## Prerequisites

Before you begin, ensure you have the following installed:

- [Python 3.7+](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/installation/)
- [Virtualenv](https://virtualenv.pypa.io/en/latest/) (optional, but recommended)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/turn-based-game-server.git
   cd turn-based-game-server
    ```

2. **Create a virtual environment (optional but recommended):**
    ```
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. **Start the Flask server:**
    ```
    pip install requirements.txt
    
    python app.py
    ```
