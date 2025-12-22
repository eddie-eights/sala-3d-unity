using System;
using System.Collections.Generic;

/// <summary>
/// DTO classes for TTS Response v1 from TTS server.
/// Maps to the /v1/tts JSON response format.
/// </summary>
[Serializable]
public class TtsResponseV1
{
    public string version;
    public string request_id;
    public AudioInfo audio;
    public TimingInfo timing;
    public MetaInfo meta;
}

[Serializable]
public class AudioInfo
{
    public string format;
    public int sample_rate;
    public int channels;
    public float duration_sec;
    public string base64;
    public string url;
}

[Serializable]
public class TimingInfo
{
    public string timebase;
    public List<VisemeEvent> visemes;
    public List<PhonemeEvent> phonemes;
}

[Serializable]
public class VisemeEvent
{
    public float t;  // time in seconds from audio start
    public string v; // viseme: A/I/U/E/O/N/sil
    public float w;  // weight 0-1
    
    public VisemeEvent()
    {
        w = 1.0f;
    }
}

[Serializable]
public class PhonemeEvent
{
    public float t0; // start time
    public float t1; // end time
    public string p; // phoneme label
}

[Serializable]
public class MetaInfo
{
    public string engine;
    public int speaker_id;
}
