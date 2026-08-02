# FROM docker.io/oven/bun:1.2.20-debian


# USER root


# RUN apt-get update && apt-get install -y \
#     python3 \
#     python3-pip \
#     python3-venv \
#     ffmpeg \
#     git \
#     curl

# # Ambiente Python isolado para WhisperX
# RUN python3 -m venv /opt/venv

# ENV PATH="/opt/venv/bin:$PATH"

# RUN pip install --upgrade pip && \
#     pip install \
#         yt-dlp \
#         whisperx


# RUN apt-get install -y \
#     bash \
#     bash-completion 

# WORKDIR /appnautilus


# USER bun











# CUDA Runtime + cuDNN
FROM docker.io/nvidia/cuda:12.8.1-cudnn-runtime-ubuntu24.04

ENV DEBIAN_FRONTEND=noninteractive

# -----------------------------------------------------------------------------
# Sistema
# -----------------------------------------------------------------------------

RUN apt-get update && apt-get install -y \
    bash \
    bash-completion \
    build-essential \
    ca-certificates \
    curl \
    unzip \
    zip \
    ffmpeg \
    git \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
 && rm -rf /var/lib/apt/lists/*


# ------------------------------------------------------------------------------
# Ambiente Python isolado 
# ------------------------------------------------------------------------------

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install faster-whisper yt-dlp

# -----------------------------------------------------------------------------
# Bun
# -----------------------------------------------------------------------------

RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL=/root/.bun
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

# -----------------------------------------------------------------------------
# Usuário de desenvolvimento
# -----------------------------------------------------------------------------

RUN useradd -ms /bin/bash bun

RUN mkdir -p /app && \
    chown -R bun:bun /app

WORKDIR /app

USER bun

# Bun também para o usuário bun
ENV BUN_INSTALL=/home/bun/.bun
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

RUN curl -fsSL https://bun.sh/install | bash

CMD ["sleep", "infinity"]