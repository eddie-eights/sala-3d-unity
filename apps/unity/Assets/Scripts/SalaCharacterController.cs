using UnityEngine;
using System.Runtime.InteropServices;

/// <summary>
/// SalaCharacterController is the main controller for the 3D character.
/// Integrates VRM model, lip sync, audio playback, and WebGL communication.
/// </summary>
public class SalaCharacterController : MonoBehaviour
{
    // Singleton instance for easy access
    public static SalaCharacterController Instance { get; private set; }

    [Header("Components")]
    [SerializeField] private Animator animator;
    [SerializeField] private VRMModel vrmModel;
    [SerializeField] private AudioManager audioManager;
    [SerializeField] private LipSyncController lipSyncController;

    [Header("Settings")]
    [SerializeField] private float typingSpeed = 0.05f;
    [SerializeField] private bool autoSetupComponents = true;

    // Character state
    public enum CharacterState { Idle, Talking, Listening, Thinking }
    private CharacterState currentState = CharacterState.Idle;
    public CharacterState CurrentState => currentState;

    // WebGL Bridge Imports
    [DllImport("__Internal")]
    private static extern void React_OnCharacterFinishedSpeaking();

    [DllImport("__Internal")]
    private static extern void React_OnCharacterStateChanged(string state);

    [DllImport("__Internal")]
    private static extern void React_OnAudioProgress(float progress);

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }

        // Auto-find components if not assigned
        if (autoSetupComponents)
        {
            SetupComponents();
        }
    }

    private void Start()
    {
        // TEST: Disable Animator to see if it's overriding blendshapes
        Animator animator = GetComponent<Animator>();
        if (animator != null)
        {

            animator.enabled = false;
        }
        
        // Subscribe to audio events
        if (audioManager != null)
        {
            audioManager.OnAudioStarted += OnTTSAudioStarted;
            audioManager.OnAudioFinished += OnTTSAudioFinished;
            audioManager.OnAudioProgress += OnTTSAudioProgress;
        }
    }

    private void OnDestroy()
    {
        if (audioManager != null)
        {
            audioManager.OnAudioStarted -= OnTTSAudioStarted;
            audioManager.OnAudioFinished -= OnTTSAudioFinished;
            audioManager.OnAudioProgress -= OnTTSAudioProgress;
        }
    }

    private void SetupComponents()
    {
        if (animator == null)
            animator = GetComponent<Animator>();
        
        if (vrmModel == null)
            vrmModel = GetComponentInChildren<VRMModel>();
        
        if (audioManager == null)
        {
            audioManager = GetComponent<AudioManager>();
            if (audioManager == null)
                audioManager = gameObject.AddComponent<AudioManager>();
        }
        
        if (lipSyncController == null)
        {
            lipSyncController = GetComponent<LipSyncController>();
            if (lipSyncController == null)
                lipSyncController = gameObject.AddComponent<LipSyncController>();
        }
    }

    /// <summary>
    /// Called from React to make the character speak with TTS audio.
    /// Expects base64 encoded PCM audio data.
    /// </summary>
    /// <param name="base64Audio">Base64 encoded audio</param>
    public void SpeakWithAudio(string base64Audio)
    {

        
        SetState(CharacterState.Talking);
        
        if (audioManager != null)
        {
            audioManager.PlayBase64Audio(base64Audio);
        }
    }

    /// <summary>
    /// Called from React to make the character speak with WAV audio.
    /// Used when OpenAI TTS returns WAV format.
    /// </summary>
    public void SpeakWithWav(string base64Wav)
    {

        
        SetState(CharacterState.Talking);
        
        if (audioManager != null)
        {
            audioManager.PlayBase64Wav(base64Wav);
        }
    }

    /// <summary>
    /// Called from React when text-only speaking (no TTS audio).
    /// Triggers animation without audio playback.
    /// </summary>
    /// <param name="text">The text being spoken</param>
    public void Speak(string text)
    {

        SetState(CharacterState.Talking);
        
        // Notify React of state change
        #if UNITY_WEBGL && !UNITY_EDITOR
        React_OnCharacterStateChanged("talking");
        #endif
    }

    /// <summary>
    /// Called from React when the assistant finishes speaking (or audio ends).
    /// </summary>
    public void StopSpeaking()
    {

        
        if (audioManager != null)
        {
            audioManager.StopAudio();
        }
        
        SetState(CharacterState.Idle);

        #if UNITY_WEBGL && !UNITY_EDITOR
        React_OnCharacterFinishedSpeaking();
        React_OnCharacterStateChanged("idle");
        #endif
    }

    /// <summary>
    /// Called from React when the user is speaking (listening mode).
    /// </summary>
    public void Listen()
    {

        SetState(CharacterState.Listening);
        
        #if UNITY_WEBGL && !UNITY_EDITOR
        React_OnCharacterStateChanged("listening");
        #endif
    }

    /// <summary>
    /// Called from React when waiting for AI response.
    /// </summary>
    public void Think()
    {

        SetState(CharacterState.Thinking);
        
        #if UNITY_WEBGL && !UNITY_EDITOR
        React_OnCharacterStateChanged("thinking");
        #endif
    }

    /// <summary>
    /// Called from React to reset to idle.
    /// </summary>
    public void Idle()
    {

        SetState(CharacterState.Idle);
    }

    /// <summary>
    /// Set character expression.
    /// </summary>
    /// <param name="expression">Expression name: joy, angry, sorrow, fun, surprised, neutral</param>
    public void SetExpression(string expression)
    {
        if (vrmModel != null)
        {
            vrmModel.SetExpression(expression);
        }
    }

    /// <summary>
    /// Set expression with weight.
    /// </summary>
    public void SetExpressionWithWeight(string data)
    {
        // Expects format: "expression:weight" e.g., "joy:0.8"
        var parts = data.Split(':');
        if (parts.Length >= 2 && float.TryParse(parts[1], out float weight))
        {
            if (vrmModel != null)
            {
                vrmModel.SetExpression(parts[0], weight);
            }
        }
    }

    private void SetState(CharacterState newState)
    {
        currentState = newState;
        
        if (animator != null)
        {
            animator.SetBool("IsTalking", newState == CharacterState.Talking);
            animator.SetBool("IsListening", newState == CharacterState.Listening);
            animator.SetBool("IsThinking", newState == CharacterState.Thinking);
        }
    }

    // Audio event handlers
    private void OnTTSAudioStarted()
    {

    }

    private void OnTTSAudioFinished()
    {

        SetState(CharacterState.Idle);

        #if UNITY_WEBGL && !UNITY_EDITOR
        React_OnCharacterFinishedSpeaking();
        React_OnCharacterStateChanged("idle");
        #endif
    }

    private void OnTTSAudioProgress(float progress)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        React_OnAudioProgress(progress);
        #endif
    }

    /// <summary>
    /// Get audio playback status.
    /// </summary>
    public bool IsPlaying()
    {
        return audioManager != null && audioManager.IsPlaying;
    }
}
