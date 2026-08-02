# asasdfkjdsakljf

whisperx a.webm --model small --language pt --device cuda --output_format srt
whisperx a.webm --model small --language pt --compute_type float32 --output_format srt

whisperx a.webm --device cpu --model small --output_format srt











pip uninstall -y torch torchvision torchaudio

pip install \
  torch==2.5.1 \
  torchvision==0.20.1 \
  torchaudio==2.5.1 \
  --index-url https://download.pytorch.org/whl/cu124




  sudo chown -R "$(whoami):$(id -gn)" .