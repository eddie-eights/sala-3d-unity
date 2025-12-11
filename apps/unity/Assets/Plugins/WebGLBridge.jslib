mergeInto(LibraryManager.library, {
  // Called when character finishes speaking/audio playback
  React_OnCharacterFinishedSpeaking: function () {
    try {
      if (window.dispatchReactUnityEvent) {
        window.dispatchReactUnityEvent("OnCharacterFinishedSpeaking");
      }
    } catch (e) {
      console.warn("React_OnCharacterFinishedSpeaking failed", e);
    }
  },

  // Called when character state changes (idle, talking, listening, thinking)
  React_OnCharacterStateChanged: function (stateData) {
    try {
      var stateStr = UTF8ToString(stateData);
      if (window.dispatchReactUnityEvent) {
        window.dispatchReactUnityEvent("OnCharacterStateChanged", stateStr);
      }
    } catch (e) {
      console.warn("React_OnCharacterStateChanged failed", e);
    }
  },

  // Called during audio playback with progress (0-1)
  React_OnAudioProgress: function (progress) {
    try {
      if (window.dispatchReactUnityEvent) {
        window.dispatchReactUnityEvent("OnAudioProgress", progress);
      }
    } catch (e) {
      console.warn("React_OnAudioProgress failed", e);
    }
  },
});
