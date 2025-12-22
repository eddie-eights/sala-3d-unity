using UnityEngine;
using System;
using System.Collections.Generic;

/// <summary>
/// LipSyncController provides audio-driven mouth animation.
/// Supports amplitude-based, timing-based (viseme events), and manual modes.
/// </summary>
public class LipSyncController : MonoBehaviour
{
    public static LipSyncController Instance { get; private set; }

    [Header("References")]
    [SerializeField] private VRMModel vrmModel;
    [SerializeField] private AudioManager audioManager;

    [Header("Lip Sync Settings")]
    [SerializeField] private LipSyncMode mode = LipSyncMode.AmplitudeBased;
    [SerializeField] [Range(0.1f, 5f)] private float sensitivity = 2f;
    [SerializeField] [Range(0.01f, 0.5f)] private float smoothing = 0.02f;
    [SerializeField] [Range(0f, 1f)] private float minOpenness = 0f;
    [SerializeField] [Range(0f, 1f)] private float maxOpenness = 1f;

    [Header("Timing Mode Settings")]
    [SerializeField] [Range(0.01f, 0.2f)] private float attackTime = 0.05f;
    [SerializeField] [Range(0.01f, 0.3f)] private float releaseTime = 0.1f;

    [Header("Amplitude Mode Settings")]
    [SerializeField] private bool useRandomVowels = true;
    [SerializeField] [Range(0.1f, 1f)] private float vowelChangeRate = 0.3f;

    public enum LipSyncMode
    {
        AmplitudeBased,  // Simple amplitude-based (fallback)
        TimingBased,     // Uses viseme timing from TTS server
        ULipSync,        // Uses uLipSync library
        Manual           // Controlled externally
    }

    // Viseme event from TTS server
    [System.Serializable]
    public class VisemeEvent
    {
        public float t;  // time in seconds
        public string v; // viseme: A/I/U/E/O/X
        public float w;  // weight 0-1
        public float d;  // duration (optional)
    }

    // Current mouth weights
    private float[] targetWeights = new float[5]; // A, I, U, E, O
    private float[] currentWeights = new float[5];
    
    private float currentAmplitude = 0f;
    private float nextVowelChangeTime = 0f;
    private int currentVowelIndex = 0;

    private bool isActive = false;

    // Timing-based mode data
    private List<VisemeEvent> visemeEvents = new List<VisemeEvent>();
    private int currentEventIndex = 0;
    private float audioStartTime = 0f;

    // Vowel to index mapping
    // A=0, I=1, U=2, E=3, O=4, X/sil/N = -1 (closed mouth)
    private static readonly Dictionary<string, int> VowelToIndex = new Dictionary<string, int>
    {
        {"A", 0}, {"I", 1}, {"U", 2}, {"E", 3}, {"O", 4}, 
        {"X", -1}, {"sil", -1}, {"N", -1}
    };

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
    }

    private void Start()
    {
        if (vrmModel == null) vrmModel = VRMModel.Instance;
        if (audioManager == null) audioManager = AudioManager.Instance;

        if (audioManager != null)
        {
            audioManager.OnAudioStarted += OnAudioStarted;
            audioManager.OnAudioFinished += OnAudioFinished;
        }
    }

    private void OnDestroy()
    {
        if (audioManager != null)
        {
            audioManager.OnAudioStarted -= OnAudioStarted;
            audioManager.OnAudioFinished -= OnAudioFinished;
        }
    }

    private void LateUpdate()
    {
        if (!isActive || vrmModel == null) return;

        switch (mode)
        {
            case LipSyncMode.TimingBased:
                UpdateTimingBasedLipSync();
                break;
            case LipSyncMode.AmplitudeBased:
                UpdateAmplitudeBasedLipSync();
                break;
            // ULipSync and Manual handled externally
        }
    }

    /// <summary>
    /// Set viseme events from TTS server response.
    /// Call this before playing audio.
    /// </summary>
    public void SetVisemeEvents(List<VisemeEvent> events)
    {
        visemeEvents = events ?? new List<VisemeEvent>();
        currentEventIndex = 0;
        
        // Automatically switch to timing-based mode if events are provided
        if (visemeEvents.Count > 0)
        {
            mode = LipSyncMode.TimingBased;
        }
        else
        {
            mode = LipSyncMode.AmplitudeBased;
        }
    }

    /// <summary>
    /// Set viseme events from JSON string.
    /// </summary>
    public void SetVisemeEventsFromJson(string json)
    {
        try
        {
            var wrapper = JsonUtility.FromJson<VisemeEventListWrapper>("{\"events\":" + json + "}");
            SetVisemeEvents(wrapper.events);
        }
        catch (Exception e)
        {
            Debug.LogWarning($"LipSync: Failed to parse viseme events: {e.Message}");
            SetVisemeEvents(null);
        }
    }

    [Serializable]
    private class VisemeEventListWrapper
    {
        public List<VisemeEvent> events;
    }

    private void UpdateTimingBasedLipSync()
    {
        if (audioManager == null || !audioManager.IsPlaying) return;

        float currentTime = audioManager.GetAudioSource().time;

        // Find current event based on audio time
        while (currentEventIndex < visemeEvents.Count - 1 &&
               visemeEvents[currentEventIndex + 1].t <= currentTime)
        {
            currentEventIndex++;
        }

        // Reset targets
        for (int i = 0; i < 5; i++)
        {
            targetWeights[i] = 0f;
        }

        // Apply current viseme
        if (currentEventIndex < visemeEvents.Count)
        {
            var evt = visemeEvents[currentEventIndex];
            
            if (VowelToIndex.TryGetValue(evt.v, out int vowelIdx) && vowelIdx >= 0)
            {
                targetWeights[vowelIdx] = evt.w;
            }
            // X (closed mouth) = all weights 0
        }

        // Smooth interpolation with attack/release
        float lerpSpeed = Time.deltaTime / attackTime;
        for (int i = 0; i < 5; i++)
        {
            if (targetWeights[i] > currentWeights[i])
            {
                // Attack
                currentWeights[i] = Mathf.Lerp(currentWeights[i], targetWeights[i], lerpSpeed);
            }
            else
            {
                // Release (slower)
                currentWeights[i] = Mathf.Lerp(currentWeights[i], targetWeights[i], Time.deltaTime / releaseTime);
            }
        }

        // Apply to VRM model
        vrmModel.SetMouthWeights(
            currentWeights[0], // A
            currentWeights[1], // I
            currentWeights[2], // U
            currentWeights[3], // E
            currentWeights[4]  // O
        );
    }

    private void UpdateAmplitudeBasedLipSync()
    {
        float rawAmplitude = 0f;
        if (audioManager != null)
        {
            rawAmplitude = audioManager.GetCurrentAmplitude();
        }

        currentAmplitude = Mathf.Lerp(currentAmplitude, rawAmplitude * sensitivity, Time.deltaTime / smoothing);
        currentAmplitude = Mathf.Clamp01(currentAmplitude);

        float openness = Mathf.Lerp(minOpenness, maxOpenness, currentAmplitude);

        if (useRandomVowels && Time.time > nextVowelChangeTime && openness > 0.1f)
        {
            currentVowelIndex = UnityEngine.Random.Range(0, 5);
            nextVowelChangeTime = Time.time + vowelChangeRate;
        }

        for (int i = 0; i < 5; i++)
        {
            targetWeights[i] = 0f;
        }

        if (openness > 0.05f)
        {
            targetWeights[currentVowelIndex] = openness;
            
            if (useRandomVowels)
            {
                int secondaryVowel = (currentVowelIndex + 2) % 5;
                targetWeights[secondaryVowel] = openness * 0.3f;
            }
        }

        for (int i = 0; i < 5; i++)
        {
            currentWeights[i] = Mathf.Lerp(currentWeights[i], targetWeights[i], Time.deltaTime / smoothing);
        }

        vrmModel.SetMouthWeights(
            currentWeights[0],
            currentWeights[1],
            currentWeights[2],
            currentWeights[3],
            currentWeights[4]
        );
    }

    private void OnAudioStarted()
    {
        isActive = true;
        currentEventIndex = 0;
        audioStartTime = Time.time;
    }

    private void OnAudioFinished()
    {
        isActive = false;
        
        if (vrmModel != null)
        {
            vrmModel.ResetMouth();
        }
        
        for (int i = 0; i < 5; i++)
        {
            currentWeights[i] = 0f;
            targetWeights[i] = 0f;
        }
        
        visemeEvents.Clear();
        currentEventIndex = 0;
    }

    public void SetMouthWeights(float a, float i, float u, float e, float o)
    {
        if (mode != LipSyncMode.Manual && mode != LipSyncMode.ULipSync) return;
        
        if (vrmModel != null)
        {
            vrmModel.SetMouthWeights(a, i, u, e, o);
        }
    }

    public void StartLipSync()
    {
        isActive = true;
    }

    public void StopLipSync()
    {
        isActive = false;
        if (vrmModel != null)
        {
            vrmModel.ResetMouth();
        }
    }

    public void SetMode(LipSyncMode newMode)
    {
        mode = newMode;
    }

    public LipSyncMode GetCurrentMode()
    {
        return mode;
    }
}
