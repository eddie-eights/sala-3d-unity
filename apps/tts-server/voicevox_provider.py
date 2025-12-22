"""
VOICEVOX TTS Provider Implementation
"""

import httpx
from tts_provider import TTSProvider, TTSResult


class VoicevoxProvider(TTSProvider):
    """VOICEVOX TTS provider implementation."""
    
    def __init__(self, base_url: str = "http://127.0.0.1:50021"):
        self.base_url = base_url
        self._client: httpx.AsyncClient | None = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None
    
    async def synthesize(self, text: str, speaker_id: int, speed: float = 1.3) -> TTSResult:
        client = await self._get_client()
        
        # Step 1: Get audio query
        query_response = await client.post(
            f"{self.base_url}/audio_query",
            params={"text": text, "speaker": speaker_id}
        )
        query_response.raise_for_status()
        audio_query = query_response.json()
        
        # Set speed scale (1.0 = normal, 1.5 = 50% faster)
        audio_query["speedScale"] = speed
        
        # Step 2: Extract phoneme timing from accent_phrases (before speed adjustment)
        phoneme_timing = self._extract_phoneme_timing(audio_query, speed)
        
        # Step 3: Synthesize audio
        synth_response = await client.post(
            f"{self.base_url}/synthesis",
            params={"speaker": speaker_id},
            json=audio_query
        )
        synth_response.raise_for_status()
        audio_bytes = synth_response.content
        
        # Get sample rate from WAV header
        sample_rate = int.from_bytes(audio_bytes[24:28], "little")
        
        return TTSResult(
            audio_bytes=audio_bytes,
            sample_rate=sample_rate,
            phoneme_timing=phoneme_timing
        )
    
    def _extract_phoneme_timing(self, audio_query: dict, speed: float = 1.0) -> list[dict]:
        """Extract phoneme timing from VOICEVOX audio_query, adjusted for speed."""
        timing = []
        current_time = 0.0
        
        for phrase in audio_query.get("accent_phrases", []):
            for mora in phrase.get("moras", []):
                consonant = mora.get("consonant", "")
                consonant_length_raw = mora.get("consonant_length")
                consonant_length = (consonant_length_raw or 0.0) / speed
                vowel = mora.get("vowel", "")
                vowel_length_raw = mora.get("vowel_length")
                vowel_length = (vowel_length_raw or 0.1) / speed
                
                if consonant and consonant_length > 0.01:
                    timing.append({
                        "phoneme": consonant,
                        "start": current_time,
                        "duration": consonant_length,
                        "type": "consonant"
                    })
                    current_time += consonant_length
                
                if vowel:
                    timing.append({
                        "phoneme": vowel,
                        "start": current_time,
                        "duration": vowel_length,
                        "type": "vowel"
                    })
                    current_time += vowel_length
            
            # Handle pause
            pause_mora = phrase.get("pause_mora")
            if pause_mora:
                pause_length_raw = pause_mora.get("vowel_length")
                pause_length = (pause_length_raw or 0.1) / speed
                timing.append({
                    "phoneme": "pau",
                    "start": current_time,
                    "duration": pause_length,
                    "type": "pause"
                })
                current_time += pause_length
        
        return timing
    
    async def get_speakers(self) -> list[dict]:
        client = await self._get_client()
        response = await client.get(f"{self.base_url}/speakers")
        response.raise_for_status()
        return response.json()
    
    async def health_check(self) -> bool:
        try:
            client = await self._get_client()
            response = await client.get(f"{self.base_url}/version")
            return response.status_code == 200
        except Exception:
            return False
