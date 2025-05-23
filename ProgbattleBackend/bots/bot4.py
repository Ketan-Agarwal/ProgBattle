import random

# Keep track of previous ball position
prev_ball_x = None

def next_move(state):
    global prev_ball_x

    ball_x = state["ball"]["x"]
    my_x = state["you"]["x"]

    # 15% chance to go haywire
    if random.random() < 0.15:
        return random.choice(["left", "right", "stay"])

    # Try to predict next position
    if prev_ball_x is not None:
        dx = ball_x - prev_ball_x
        predicted_x = ball_x + dx
    else:
        predicted_x = ball_x

    prev_ball_x = ball_x

    if predicted_x < my_x:
        return "left"
    elif predicted_x > my_x + 1:
        return "right"
    else:
        return "stay"
