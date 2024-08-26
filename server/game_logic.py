import random


def get_possible_moves(piece_type, x, y, board_size=5):
    possible_moves = []

    def is_within_bounds(nx, ny):
        return 0 <= nx < board_size and 0 <= ny < board_size

    if "p" in piece_type:
        # Pawn can move 1 block in any direction (Left, Right, Forward, Backward)
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # F, R, B, L
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if is_within_bounds(nx, ny):
                possible_moves.append((nx, ny))

    elif piece_type == "h1":
        # Hero1 can move 2 blocks straight in any direction (Left, Right, Forward, Backward)
        directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]  # F, R, B, L
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if is_within_bounds(nx, ny):
                possible_moves.append((nx, ny))

    elif piece_type == "h2":
        # Hero2 can move 2 blocks diagonally in any direction (FL, FR, BL, BR)
        directions = [(2, 2), (2, -2), (-2, 2), (-2, -2)]  # FL, FR, BL, BR
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if is_within_bounds(nx, ny):
                possible_moves.append((nx, ny))

    return possible_moves


# Example usage:
# pawn_position = (0, 0)
# hero1_position = (0, 0)
# hero2_position = (4, 4)

# print("Pawn moves:", get_possible_moves("Pawn", pawn_position))
# print("Hero1 moves:", get_possible_moves("Hero1", hero1_position))
# print("Hero2 moves:", get_possible_moves("Hero2", hero2_position))
