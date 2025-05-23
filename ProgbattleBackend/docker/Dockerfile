# Use official Python image
FROM python:3.12-slim

# Create a working directory
WORKDIR /app

# Install dependencies
# Copy the engine and bots
COPY ./engine/engine.py /app/engine.py

# Add entrypoint script (we’ll define it next)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Default command
ENTRYPOINT ["/entrypoint.sh"]
