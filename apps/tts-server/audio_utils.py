"""
Audio utilities for TTS server.
"""

import struct


def apply_fade_in(wav_bytes: bytes, fade_ms: int = 5) -> bytes:
    """
    Apply fade-in to WAV audio to prevent pop noise at start.
    
    Args:
        wav_bytes: WAV file as bytes
        fade_ms: Fade duration in milliseconds (default: 5ms)
    
    Returns:
        Modified WAV bytes with fade-in applied
    """
    if len(wav_bytes) < 44:
        return wav_bytes
    
    # Parse WAV header
    sample_rate = struct.unpack('<I', wav_bytes[24:28])[0]
    bits_per_sample = struct.unpack('<H', wav_bytes[34:36])[0]
    channels = struct.unpack('<H', wav_bytes[22:24])[0]
    
    # Calculate fade samples
    fade_samples = int(sample_rate * fade_ms / 1000)
    bytes_per_sample = bits_per_sample // 8
    data_start = 44  # Standard WAV header size
    
    # Convert to mutable bytearray
    wav_data = bytearray(wav_bytes)
    
    # Apply fade-in to first fade_samples
    for i in range(fade_samples):
        for ch in range(channels):
            offset = data_start + (i * channels + ch) * bytes_per_sample
            if offset + bytes_per_sample > len(wav_data):
                break
            
            # Read sample
            if bytes_per_sample == 2:
                sample = struct.unpack('<h', wav_data[offset:offset+2])[0]
                # Apply fade multiplier
                fade_mult = i / fade_samples
                sample = int(sample * fade_mult)
                # Write back
                wav_data[offset:offset+2] = struct.pack('<h', sample)
    
    return bytes(wav_data)
