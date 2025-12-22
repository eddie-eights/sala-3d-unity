"""
Phoneme to Viseme conversion for Japanese VRM models.
Maps VOICEVOX phonemes to A/I/U/E/O/X visemes.
"""

from typing import Literal

VisemeType = Literal["A", "I", "U", "E", "O", "X"]

# Japanese phoneme to viseme mapping
# Based on mouth shape for each sound
PHONEME_TO_VISEME: dict[str, VisemeType] = {
    # Vowels - direct mapping
    "a": "A",
    "i": "I",
    "u": "U",
    "e": "E",
    "o": "O",
    
    # Consonants with vowel endings (Japanese mora)
    # K-row
    "ka": "A", "ki": "I", "ku": "U", "ke": "E", "ko": "O",
    # S-row
    "sa": "A", "si": "I", "shi": "I", "su": "U", "se": "E", "so": "O",
    # T-row
    "ta": "A", "ti": "I", "chi": "I", "tu": "U", "tsu": "U", "te": "E", "to": "O",
    # N-row
    "na": "A", "ni": "I", "nu": "U", "ne": "E", "no": "O",
    # H-row
    "ha": "A", "hi": "I", "hu": "U", "fu": "U", "he": "E", "ho": "O",
    # M-row
    "ma": "A", "mi": "I", "mu": "U", "me": "E", "mo": "O",
    # Y-row
    "ya": "A", "yu": "U", "yo": "O",
    # R-row
    "ra": "A", "ri": "I", "ru": "U", "re": "E", "ro": "O",
    # W-row
    "wa": "A", "wo": "O",
    # N (standalone)
    "N": "X",
    "n": "X",
    "nn": "X",
    
    # Voiced consonants
    # G-row
    "ga": "A", "gi": "I", "gu": "U", "ge": "E", "go": "O",
    # Z-row
    "za": "A", "zi": "I", "ji": "I", "zu": "U", "ze": "E", "zo": "O",
    # D-row
    "da": "A", "di": "I", "du": "U", "de": "E", "do": "O",
    # B-row
    "ba": "A", "bi": "I", "bu": "U", "be": "E", "bo": "O",
    # P-row
    "pa": "A", "pi": "I", "pu": "U", "pe": "E", "po": "O",
    
    # Combination sounds (拗音)
    "kya": "A", "kyu": "U", "kyo": "O",
    "sha": "A", "shu": "U", "sho": "O",
    "cha": "A", "chu": "U", "cho": "O",
    "nya": "A", "nyu": "U", "nyo": "O",
    "hya": "A", "hyu": "U", "hyo": "O",
    "mya": "A", "myu": "U", "myo": "O",
    "rya": "A", "ryu": "U", "ryo": "O",
    "gya": "A", "gyu": "U", "gyo": "O",
    "ja": "A", "ju": "U", "jo": "O",
    "bya": "A", "byu": "U", "byo": "O",
    "pya": "A", "pyu": "U", "pyo": "O",
    
    # Special/silence
    "pau": "X",
    "cl": "X",
    "sil": "X",
    "sp": "X",
    "": "X",
}


def phoneme_to_viseme(phoneme: str) -> VisemeType:
    """
    Convert a phoneme string to a viseme.
    Falls back to 'X' (closed mouth) for unknown phonemes.
    """
    # Try exact match first
    if phoneme in PHONEME_TO_VISEME:
        return PHONEME_TO_VISEME[phoneme]
    
    # Try lowercase
    phoneme_lower = phoneme.lower()
    if phoneme_lower in PHONEME_TO_VISEME:
        return PHONEME_TO_VISEME[phoneme_lower]
    
    # Check if ends with a vowel
    for vowel, viseme in [("a", "A"), ("i", "I"), ("u", "U"), ("e", "E"), ("o", "O")]:
        if phoneme_lower.endswith(vowel):
            return viseme
    
    # Default to closed mouth
    return "X"
