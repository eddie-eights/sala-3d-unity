"""
TTS Server - Official API v1
POST /v1/tts endpoint with viseme timing for Unity VRM lip sync.
Wraps VOICEVOX (MVP) / Future PyTorch models.
"""

import os
import uuid
import base64
import asyncio
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from phoneme_to_viseme import phoneme_to_viseme
from voicevox_provider import VoicevoxProvider
from tts_provider import TTSProvider
from audio_utils import apply_fade_in


# Configuration
VOICEVOX_URL = os.getenv("VOICEVOX_URL", "http://127.0.0.1:50021")
DEFAULT_SPEAKER_ID = int(os.getenv("DEFAULT_SPEAKER_ID", "1"))  # ずんだもん
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "voicevox")
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", "3"))

# Semaphore for concurrent request limiting
tts_semaphore: asyncio.Semaphore = None


# ============ Request Models ============

class StyleParams(BaseModel):
    speed: float = 1.0
    pitch: float = 0.0
    intonation: float = 1.0
    volume: float = 1.0


class TimingParams(BaseModel):
    format: str = "viseme"
    include_phonemes: bool = True


class ClientParams(BaseModel):
    sample_rate: int = 48000


class TtsRequest(BaseModel):
    text: str
    speaker_id: Optional[int] = DEFAULT_SPEAKER_ID
    style: Optional[StyleParams] = None
    timing: Optional[TimingParams] = None
    client: Optional[ClientParams] = None


# ============ Response Models ============

class AudioInfo(BaseModel):
    format: str = "wav"
    sample_rate: int
    channels: int = 1
    duration_sec: float
    base64: Optional[str] = None  # For inline audio
    url: Optional[str] = None     # For hosted audio (future)


class VisemeEvent(BaseModel):
    t: float = Field(..., description="Time in seconds from audio start")
    v: str = Field(..., description="Viseme: A/I/U/E/O/N/sil")
    w: float = Field(1.0, description="Weight 0-1")


class PhonemeEvent(BaseModel):
    t0: float = Field(..., description="Start time in seconds")
    t1: float = Field(..., description="End time in seconds")
    p: str = Field(..., description="Phoneme label")


class TimingInfo(BaseModel):
    timebase: str = "audio_start"
    visemes: list[VisemeEvent]
    phonemes: Optional[list[PhonemeEvent]] = None


class MetaInfo(BaseModel):
    engine: str
    speaker_id: int


class TtsResponseV1(BaseModel):
    version: str = "1.0"
    request_id: str
    audio: AudioInfo
    timing: TimingInfo
    meta: MetaInfo


# ============ TTS Provider ============

tts_provider: TTSProvider = None


def get_tts_provider() -> TTSProvider:
    global tts_provider
    if tts_provider is None:
        if TTS_PROVIDER == "voicevox":
            tts_provider = VoicevoxProvider(VOICEVOX_URL)
        else:
            raise ValueError(f"Unknown TTS provider: {TTS_PROVIDER}")
    return tts_provider


@asynccontextmanager
async def lifespan(app: FastAPI):
    global tts_semaphore
    tts_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    get_tts_provider()
    yield
    if tts_provider:
        await tts_provider.close()


# ============ FastAPI App ============

app = FastAPI(
    title="TTS Server",
    description="Text-to-Speech API with Viseme Timing for VRM",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    provider = get_tts_provider()
    provider_healthy = await provider.health_check()
    return {
        "status": "ok" if provider_healthy else "degraded",
        "provider": TTS_PROVIDER,
        "provider_healthy": provider_healthy
    }


@app.get("/v1/speakers")
async def get_speakers():
    """Get available speakers."""
    try:
        provider = get_tts_provider()
        return await provider.get_speakers()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Provider unavailable: {e}")


@app.post("/v1/tts", response_model=TtsResponseV1)
async def synthesize(request: TtsRequest):
    """
    Synthesize speech from text with viseme timing.
    
    POST /v1/tts
    """
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    
    # Rate limiting with semaphore
    async with tts_semaphore:
        try:
            provider = get_tts_provider()
            result = await provider.synthesize(request.text, request.speaker_id)
            
            # Convert phoneme timing to viseme/phoneme events
            viseme_events, phoneme_events = convert_timing(result.phoneme_timing)
            
            # Calculate duration
            data_size = len(result.audio_bytes) - 44  # WAV header
            duration_sec = data_size / (result.sample_rate * 1 * 2)
            
            # Apply fade-in to prevent pop noise (20ms)
            audio_with_fade = apply_fade_in(result.audio_bytes, fade_ms=20)
            
            # Encode audio as base64
            audio_base64 = base64.b64encode(audio_with_fade).decode("utf-8")
            
            # Build response
            include_phonemes = request.timing.include_phonemes if request.timing else True
            
            return TtsResponseV1(
                version="1.0",
                request_id=request_id,
                audio=AudioInfo(
                    format="wav",
                    sample_rate=result.sample_rate,
                    channels=1,
                    duration_sec=round(duration_sec, 3),
                    base64=audio_base64
                ),
                timing=TimingInfo(
                    timebase="audio_start",
                    visemes=viseme_events,
                    phonemes=phoneme_events if include_phonemes else None
                ),
                meta=MetaInfo(
                    engine=TTS_PROVIDER,
                    speaker_id=request.speaker_id
                )
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


def convert_timing(phoneme_timing: list[dict]) -> tuple[list[VisemeEvent], list[PhonemeEvent]]:
    """Convert raw phoneme timing to viseme and phoneme events."""
    visemes: list[VisemeEvent] = []
    phonemes: list[PhonemeEvent] = []
    
    for item in phoneme_timing:
        phoneme = item.get("phoneme", "")
        start = item.get("start", 0.0)
        duration = item.get("duration", 0.1)
        end = start + duration
        ptype = item.get("type", "vowel")
        
        # Add phoneme event
        phonemes.append(PhonemeEvent(
            t0=round(start, 3),
            t1=round(end, 3),
            p=phoneme
        ))
        
        # Convert to viseme
        if ptype == "consonant" or ptype == "pause":
            visemes.append(VisemeEvent(
                t=round(start, 3),
                v="sil",
                w=0.8 if ptype == "consonant" else 1.0
            ))
        else:
            vis = phoneme_to_viseme(phoneme)
            visemes.append(VisemeEvent(
                t=round(start, 3),
                v=vis,
                w=1.0
            ))
    
    # Ensure ends with silence
    if visemes and visemes[-1].v != "sil":
        last_end = phonemes[-1].t1 if phonemes else 0.0
        visemes.append(VisemeEvent(
            t=round(last_end, 3),
            v="sil",
            w=1.0
        ))
    
    return visemes, phonemes


# Legacy endpoint for backward compatibility
@app.post("/synthesize", response_model=TtsResponseV1)
async def synthesize_legacy(request: TtsRequest):
    """Legacy endpoint - redirects to /v1/tts"""
    return await synthesize(request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
