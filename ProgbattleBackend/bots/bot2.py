import random

def next_move(state):
    # 5% random screw-up
    if random.random() < 0.05:
        return random.choice(["left", "right", "stay"])
    else:
        ball_x = state["ball"]["x"]
        my_x = state["you"]["x"]

        if ball_x < my_x:
            return "left"
        elif ball_x > my_x:
            return "right"
        else:
            return random.choice(["left", "right"])  # overshoot even if aligned
