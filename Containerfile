FROM docker.io/oven/bun:1.2.20-debian


USER root


RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/


# Ambiente Python isolado para WhisperX
RUN python3 -m venv /opt/venv


ENV PATH="/opt/venv/bin:$PATH"


RUN pip install --upgrade pip && \
    pip install \
        yt-dlp \
        whisperx


WORKDIR /app


USER bun