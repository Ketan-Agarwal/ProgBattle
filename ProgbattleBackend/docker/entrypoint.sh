#!/bin/bash
set -e

# Assume you pass bot1 and bot2 as mounted files
BOT1=${1:-bot1.py}
BOT2=${2:-bot2.py}

echo "Running engine with $BOT1 vs $BOT2..."
python3 engine.py --p1 "$BOT1" --p2 "$BOT2"

# Persist log
cp game_log.csv /output/game_log.csv