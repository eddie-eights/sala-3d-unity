# Sala 3D - Unity Project

This directory contains the Unity project for the 3D character component of the Sala application.

## 🛠️ Setup Instructions

### 1. Unity Version

- **Unity 2022.3 LTS** or newer required

### 2. Required Packages

Install the following packages:

#### UniVRM (VRM 1.0)

VRoid model import support:

1. Download from: https://github.com/vrm-c/UniVRM/releases
2. Import the `.unitypackage` file
3. Or use Package Manager with git URL: `https://github.com/vrm-c/UniVRM.git?path=/Assets/VRM10`

#### uLipSync (Optional - for enhanced lip sync)

Real-time phoneme-based lip sync:

1. Download from: https://github.com/hecomi/uLipSync
2. Import via Package Manager or `.unitypackage`

### 3. Open Project

1. Open **Unity Hub**
2. Click **Add** and select this `apps/unity` folder
3. Wait for Unity to import all assets

---

## 🎨 Scene Setup

### Import VRoid Model

1. Export your character from VRoid Studio as `.vrm` file
2. Create folder: `Assets/Models/`
3. Drag `.vrm` file into the folder
4. Unity will import via UniVRM

### Create Scene

1. Create new scene: `Assets/Scenes/MainScene.unity`
2. Drag your VRM model into the scene
3. Add scripts to the model:
   - `SalaCharacterController`
   - `VRMModel`
   - `AudioManager`
   - `LipSyncController`

### Animator Setup

1. Add `Animator` component to your character
2. Create Animator Controller with parameters:
   - `IsTalking` (Bool)
   - `IsListening` (Bool)
   - `IsThinking` (Bool)
3. Set up animation states and transitions

---

## 📦 Scripts Overview

| Script                       | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `SalaCharacterController.cs` | Main controller - integrates all components |
| `VRMModel.cs`                | VRM model handling and blendshape control   |
| `AudioManager.cs`            | TTS audio playback from base64 data         |
| `LipSyncController.cs`       | Audio-driven mouth animation                |
| `WebGLBridge.jslib`          | Unity ↔ React communication                 |

---

## 📦 Building for WebGL

1. Go to `File` > `Build Settings`
2. Switch Platform to **WebGL**
3. Player Settings:
   - Compression Format: **Gzip** or **Brotli**
   - Memory Size: **512MB** minimum
4. Add `MainScene` to build
5. Build to: `apps/web/public/unity-build/`

---

## 🔗 Web Integration

### React → Unity

```javascript
// Make character speak with TTS audio
unityInstance.SendMessage("SalaCharacter", "SpeakWithAudio", base64AudioData);

// Make character speak with WAV audio
unityInstance.SendMessage("SalaCharacter", "SpeakWithWav", base64WavData);

// Control character state
unityInstance.SendMessage("SalaCharacter", "Listen");
unityInstance.SendMessage("SalaCharacter", "Think");
unityInstance.SendMessage("SalaCharacter", "Idle");

// Set expression
unityInstance.SendMessage("SalaCharacter", "SetExpression", "joy");
```

### Unity → React

```javascript
// Set up event listener in React
window.dispatchReactUnityEvent = (eventName, data) => {
  switch (eventName) {
    case "OnCharacterFinishedSpeaking":
      // TTS audio completed
      break;
    case "OnCharacterStateChanged":
      // data = "idle" | "talking" | "listening" | "thinking"
      break;
    case "OnAudioProgress":
      // data = 0.0 to 1.0
      break;
  }
};
```

---

## 🎤 Audio Flow (OpenAI TTS)

```
1. React: User sends message
2. React: Call OpenAI Chat API → Get response text
3. React: Call OpenAI TTS API → Get audio (PCM/WAV)
4. React: Convert to base64, send to Unity
5. Unity: Decode audio, play with lip sync
6. Unity: Notify React when audio finishes
```

---

## 🐛 Troubleshooting

### VRM model not importing

- Ensure UniVRM package is installed
- Check Unity console for import errors

### Lip sync not working

- Verify `VRMModel` detected blendshapes (check console logs)
- Ensure `AudioSource` is attached and playing

### WebGL build errors

- Check for unsupported APIs (e.g., `System.IO.File`)
- Use conditional compilation: `#if UNITY_WEBGL && !UNITY_EDITOR`
