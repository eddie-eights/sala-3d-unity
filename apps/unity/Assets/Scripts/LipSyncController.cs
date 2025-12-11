using UnityEngine;
using System;

/// <summary>
/// LipSyncController provides audio-driven mouth animation.
/// Works with both amplitude-based simple lip sync and phoneme-based systems.
/// Can integrate with uLipSync if installed.
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
    [SerializeField] [Range(0.01f, 0.5f)] private float smoothing = 0.1f;
    [SerializeField] [Range(0f, 1f)] private float minOpenness = 0f;
    [SerializeField] [Range(0f, 1f)] private float maxOpenness = 1f;

    [Header("Amplitude Mode Settings")]
    [SerializeField] private bool useRandomVowels = true;
    [SerializeField] [Range(0.1f, 1f)] private float vowelChangeRate = 0.3f;

    public enum LipSyncMode
    {
        AmplitudeBased,  // Simple amplitude-based (default)
        ULipSync,        // Uses uLipSync library
        Manual           // Controlled externally
    }

    // Current mouth weights
    private float[] targetWeights = new float[5]; // A, I, U, E, O
    private float[] currentWeights = new float[5];
    
    private float currentAmplitude = 0f;
    private float nextVowelChangeTime = 0f;
    private int currentVowelIndex = 0;

    private bool isActive = false;

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
        // Auto-find references if not assigned
        if (vrmModel == null) vrmModel = VRMModel.Instance;
        if (audioManager == null) audioManager = AudioManager.Instance;

        // Subscribe to audio events
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

    private void Update()
    {
        if (!isActive || vrmModel == null) return;

        if (mode == LipSyncMode.AmplitudeBased)
        {
            UpdateAmplitudeBasedLipSync();
        }
        // ULipSync mode is handled by uLipSync directly
        // Manual mode is controlled externally
    }

    private void UpdateAmplitudeBasedLipSync()
    {
        // Get current audio amplitude
        float rawAmplitude = 0f;
        if (audioManager != null)
        {
            rawAmplitude = audioManager.GetCurrentAmplitude();
        }

        // Smooth amplitude
        currentAmplitude = Mathf.Lerp(currentAmplitude, rawAmplitude * sensitivity, Time.deltaTime / smoothing);
        currentAmplitude = Mathf.Clamp01(currentAmplitude);

        // Map to mouth openness
        float openness = Mathf.Lerp(minOpenness, maxOpenness, currentAmplitude);

        // Random vowel selection for more natural look
        if (useRandomVowels && Time.time > nextVowelChangeTime && openness > 0.1f)
        {
            currentVowelIndex = UnityEngine.Random.Range(0, 5);
            nextVowelChangeTime = Time.time + vowelChangeRate;
        }

        // Reset targets
        for (int i = 0; i < 5; i++)
        {
            targetWeights[i] = 0f;
        }

        // Set target for current vowel
        if (openness > 0.05f)
        {
            targetWeights[currentVowelIndex] = openness;
            
            // Add some secondary movement for naturalness
            if (useRandomVowels)
            {
                int secondaryVowel = (currentVowelIndex + 2) % 5;
                targetWeights[secondaryVowel] = openness * 0.3f;
            }
        }

        // Smooth interpolation
        for (int i = 0; i < 5; i++)
        {
            currentWeights[i] = Mathf.Lerp(currentWeights[i], targetWeights[i], Time.deltaTime / smoothing);
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

    private void OnAudioStarted()
    {
        isActive = true;
        Debug.Log("LipSync: Started");
    }

    private void OnAudioFinished()
    {
        isActive = false;
        
        // Reset mouth to closed
        if (vrmModel != null)
        {
            vrmModel.ResetMouth();
        }
        
        // Reset weights
        for (int i = 0; i < 5; i++)
        {
            currentWeights[i] = 0f;
            targetWeights[i] = 0f;
        }
        
        Debug.Log("LipSync: Stopped");
    }

    /// <summary>
    /// Manually set mouth weights (for Manual mode or external control).
    /// </summary>
    public void SetMouthWeights(float a, float i, float u, float e, float o)
    {
        if (mode != LipSyncMode.Manual && mode != LipSyncMode.ULipSync) return;
        
        if (vrmModel != null)
        {
            vrmModel.SetMouthWeights(a, i, u, e, o);
        }
    }

    /// <summary>
    /// Start lip sync manually (for testing or external trigger).
    /// </summary>
    public void StartLipSync()
    {
        isActive = true;
    }

    /// <summary>
    /// Stop lip sync manually.
    /// </summary>
    public void StopLipSync()
    {
        isActive = false;
        if (vrmModel != null)
        {
            vrmModel.ResetMouth();
        }
    }

    /// <summary>
    /// Set lip sync mode at runtime.
    /// </summary>
    public void SetMode(LipSyncMode newMode)
    {
        mode = newMode;
    }
}
