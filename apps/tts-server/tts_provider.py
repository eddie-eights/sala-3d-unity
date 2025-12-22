"""
TTS Provider Interface
Abstract base class for TTS providers (VOICEVOX, custom models, etc.)
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class TTSResult:
    """Result from TTS synthesis."""
    audio_bytes: bytes
    sample_rate: int
    phoneme_timing: list[dict]  # Raw phoneme timing from provider


class TTSProvider(ABC):
    """Abstract base class for TTS providers."""
    
    @abstractmethod
    async def synthesize(self, text: str, speaker_id: int) -> TTSResult:
        """
        Synthesize speech from text.
        
        Args:
            text: Text to synthesize
            speaker_id: Speaker/voice ID
            
        Returns:
            TTSResult with audio bytes and phoneme timing
        """
        pass
    
    @abstractmethod
    async def get_speakers(self) -> list[dict]:
        """Get available speakers/voices."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the provider is healthy."""
        pass
