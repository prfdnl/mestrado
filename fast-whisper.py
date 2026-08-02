from faster_whisper import WhisperModel
import json
import os
import sys

model = WhisperModel(
  "tiny",
  device="cuda",
  compute_type="int8_float32"
)

# print("modelo carregado")

input_file = sys.argv[1]
segments, info = model.transcribe(input_file)

result = []
for segment in segments:
  # print(segment.start, segment.end, segment.text)
  result.append({
    "start": segment.start,
    "end": segment.end,
    "text": segment.text,
  })

output_file = os.path.splitext(input_file)[0] + ".json"
with open(output_file, "w", encoding="utf-8") as f:
  json.dump(result, f, ensure_ascii=False, indent=2)