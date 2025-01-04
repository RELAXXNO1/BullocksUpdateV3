import sounddevice as sd
import numpy as np
import base64
import time
import json
import sys
import os

def record_audio(sample_rate=44100):
    print("Recording... Press Ctrl+C to stop.")
    recording = []
    try:
        while True:
            chunk = sd.rec(sample_rate, samplerate=sample_rate, channels=1, dtype='int16')
            sd.wait()
            recording.append(chunk)
    except KeyboardInterrupt:
        print("Recording stopped.")
    return np.concatenate(recording, axis=0)

def encode_audio(recording, sample_rate=44100):
    audio_bytes = recording.tobytes()
    base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
    return base64_audio

def send_to_mcp(base64_audio):
    mcp_command = {
        "server_name": "voice",
        "tool_name": "transcribe_audio",
        "arguments": {
            "audio": base64_audio
        }
    }
    print(json.dumps(mcp_command))

if __name__ == "__main__":
    recording = record_audio()
    base64_audio = encode_audio(recording)
    send_to_mcp(base64_audio)
