using UnityEngine;
using System;
using System.Collections;

/// <summary>
/// AudioManager handles TTS audio playback from the Web.
/// Receives base64 encoded audio from React, decodes it, and plays with lip sync.
/// </summary>
public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance { get; private set; }

    [Header("Audio")]
    [SerializeField] private AudioSource audioSource;

    [Header("Settings")]
    [SerializeField] private int sampleRate = 24000; // OpenAI TTS default sample rate
    [SerializeField] private bool useStreaming = false; // For future streaming support

    // Events
    public event Action OnAudioStarted;
    public event Action OnAudioFinished;
    public event Action<float> OnAudioProgress; // 0-1 progress

    private Coroutine playbackCoroutine;
    private bool isPlaying = false;

    public bool IsPlaying => isPlaying;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
            return;
        }

        if (audioSource == null)
        {
            audioSource = GetComponent<AudioSource>();
            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
        }
    }

    /// <summary>
    /// Play audio from base64 encoded PCM data.
    /// Called from React via SendMessage.
    /// </summary>
    /// <param name="base64Audio">Base64 encoded audio (PCM 16-bit, mono)</param>
    public void PlayBase64Audio(string base64Audio)
    {
        if (string.IsNullOrEmpty(base64Audio))
        {
            Debug.LogWarning("AudioManager: Received empty audio data");
            return;
        }

        try
        {
            byte[] audioBytes = Convert.FromBase64String(base64Audio);
            Debug.Log($"AudioManager: Decoded {audioBytes.Length} bytes of audio data");
            
            AudioClip clip = CreateAudioClipFromPCM(audioBytes);
            
            if (clip != null)
            {
                Debug.Log($"AudioManager: Created clip - samples={clip.samples}, length={clip.length:F2}s, channels={clip.channels}");
                PlayAudioClip(clip);
            }
            else
            {
                Debug.LogError("AudioManager: Failed to create AudioClip from PCM");
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"AudioManager: Failed to decode audio - {e.Message}");
        }
    }

    /// <summary>
    /// Play audio from WAV base64 data.
    /// </summary>
    public void PlayBase64Wav(string base64Wav)
    {
        if (string.IsNullOrEmpty(base64Wav))
        {
            Debug.LogWarning("AudioManager: Received empty WAV data");
            return;
        }

        try
        {
            byte[] wavBytes = Convert.FromBase64String(base64Wav);
            AudioClip clip = CreateAudioClipFromWav(wavBytes);
            
            if (clip != null)
            {
                PlayAudioClip(clip);
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"AudioManager: Failed to decode WAV - {e.Message}");
        }
    }

    /// <summary>
    /// Stop currently playing audio.
    /// </summary>
    public void StopAudio()
    {
        if (playbackCoroutine != null)
        {
            StopCoroutine(playbackCoroutine);
            playbackCoroutine = null;
        }

        if (audioSource != null && audioSource.isPlaying)
        {
            audioSource.Stop();
        }

        isPlaying = false;
        OnAudioFinished?.Invoke();
    }

    private void PlayAudioClip(AudioClip clip)
    {
        if (playbackCoroutine != null)
        {
            StopCoroutine(playbackCoroutine);
        }

        audioSource.clip = clip;
        audioSource.Play();
        isPlaying = true;

        OnAudioStarted?.Invoke();
        playbackCoroutine = StartCoroutine(MonitorPlayback());
    }

    private IEnumerator MonitorPlayback()
    {
        while (audioSource.isPlaying)
        {
            float progress = audioSource.time / audioSource.clip.length;
            OnAudioProgress?.Invoke(progress);
            yield return null;
        }

        isPlaying = false;
        OnAudioFinished?.Invoke();
        playbackCoroutine = null;
    }

    /// <summary>
    /// Create AudioClip from raw PCM 16-bit mono data.
    /// </summary>
    private AudioClip CreateAudioClipFromPCM(byte[] pcmData)
    {
        // Convert byte array to float array (PCM 16-bit)
        int sampleCount = pcmData.Length / 2;
        float[] samples = new float[sampleCount];

        for (int i = 0; i < sampleCount; i++)
        {
            short sample = BitConverter.ToInt16(pcmData, i * 2);
            samples[i] = sample / 32768f;
        }

        AudioClip clip = AudioClip.Create("TTS_Audio", sampleCount, 1, sampleRate, false);
        clip.SetData(samples, 0);
        return clip;
    }

    /// <summary>
    /// Create AudioClip from WAV byte data.
    /// Simple WAV parser for PCM format.
    /// </summary>
    private AudioClip CreateAudioClipFromWav(byte[] wavData)
    {
        // Basic WAV header parsing
        if (wavData.Length < 44)
        {
            Debug.LogError("AudioManager: WAV data too short");
            return null;
        }

        // Check RIFF header
        if (wavData[0] != 'R' || wavData[1] != 'I' || wavData[2] != 'F' || wavData[3] != 'F')
        {
            Debug.LogError("AudioManager: Invalid WAV header");
            return null;
        }

        // Read format info
        int channels = BitConverter.ToInt16(wavData, 22);
        int wavSampleRate = BitConverter.ToInt32(wavData, 24);
        int bitsPerSample = BitConverter.ToInt16(wavData, 34);

        // Find data chunk
        int dataOffset = 44; // Standard offset
        int dataSize = BitConverter.ToInt32(wavData, 40);

        // Convert to float samples
        int bytesPerSample = bitsPerSample / 8;
        int sampleCount = dataSize / bytesPerSample / channels;
        float[] samples = new float[sampleCount * channels];

        for (int i = 0; i < samples.Length; i++)
        {
            int offset = dataOffset + i * bytesPerSample;
            if (offset + bytesPerSample > wavData.Length) break;

            if (bitsPerSample == 16)
            {
                short sample = BitConverter.ToInt16(wavData, offset);
                samples[i] = sample / 32768f;
            }
            else if (bitsPerSample == 8)
            {
                samples[i] = (wavData[offset] - 128) / 128f;
            }
        }

        AudioClip clip = AudioClip.Create("TTS_Audio_WAV", sampleCount, channels, wavSampleRate, false);
        clip.SetData(samples, 0);
        return clip;
    }

    /// <summary>
    /// Get current audio amplitude for lip sync.
    /// Returns 0-1 value based on current audio output.
    /// Uses AudioClip.GetData for WebGL compatibility (GetOutputData doesn't work in WebGL).
    /// </summary>
    public float GetCurrentAmplitude()
    {
        if (!isPlaying || audioSource == null || audioSource.clip == null)
            return 0f;

        // Use AudioClip.GetData instead of GetOutputData for WebGL compatibility
        int sampleWindow = 256;
        int currentSample = audioSource.timeSamples;
        int startSample = Mathf.Max(0, currentSample - sampleWindow / 2);
        
        // Ensure we don't read past the end of the clip
        if (startSample + sampleWindow > audioSource.clip.samples)
            startSample = Mathf.Max(0, audioSource.clip.samples - sampleWindow);
        
        float[] samples = new float[sampleWindow];
        audioSource.clip.GetData(samples, startSample);

        float sum = 0f;
        for (int i = 0; i < samples.Length; i++)
        {
            sum += Mathf.Abs(samples[i]);
        }

        return Mathf.Clamp01(sum / samples.Length * 10f);
    }

    /// <summary>
    /// Get audio source for external lip sync systems (like uLipSync).
    /// </summary>
    public AudioSource GetAudioSource()
    {
        return audioSource;
    }
}
