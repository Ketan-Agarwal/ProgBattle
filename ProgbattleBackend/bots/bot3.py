import random

def next_move(state):
    # 20% chance of doing nothing
    if random.random() < 0.2:
        return "stay"

    ball_x = state["ball"]["x"]
    my_x = state["you"]["x"]

    # Only move if ball is far
    if abs(ball_x - my_x) > 2:
        if ball_x < my_x:
            return "left"
        else:
            return "right"
    else:
        return "stay"
