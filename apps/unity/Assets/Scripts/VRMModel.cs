using UnityEngine;
using System;
using System.Collections;

#if VRM_INSTALLED
using UniVRM10;
using UniGLTF;
#endif

/// <summary>
/// VRMModel handles VRoid model loading and blendshape control.
/// Provides access to VRM expression presets and mouth blendshapes for lip sync.
/// </summary>
public class VRMModel : MonoBehaviour
{
    public static VRMModel Instance { get; private set; }

    [Header("VRM Components")]
#if VRM_INSTALLED
    [SerializeField] private Vrm10Instance vrmInstance;
#endif
    [SerializeField] private SkinnedMeshRenderer faceRenderer;

    [Header("Blendshape Mapping")]
    [Tooltip("Index for mouth 'A' blendshape")]
    public int mouthA = -1;
    [Tooltip("Index for mouth 'I' blendshape")]
    public int mouthI = -1;
    [Tooltip("Index for mouth 'U' blendshape")]
    public int mouthU = -1;
    [Tooltip("Index for mouth 'E' blendshape")]
    public int mouthE = -1;
    [Tooltip("Index for mouth 'O' blendshape")]
    public int mouthO = -1;

    // Blendshape values for lip sync (0-100)
    private float[] currentMouthWeights = new float[5];

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

        AutoDetectBlendshapes();
    }

    /// <summary>
    /// Automatically detect VRM mouth blendshapes from the face mesh.
    /// VRoid models typically use: Fcl_MTH_A, Fcl_MTH_I, Fcl_MTH_U, Fcl_MTH_E, Fcl_MTH_O
    /// </summary>
    private void AutoDetectBlendshapes()
    {
        if (faceRenderer == null)
        {
            // Try to find face renderer automatically
            var renderers = GetComponentsInChildren<SkinnedMeshRenderer>();
            foreach (var renderer in renderers)
            {
                if (renderer.sharedMesh != null && renderer.sharedMesh.blendShapeCount > 0)
                {
                    // Look for face mesh (usually has the most blendshapes)
                    if (renderer.sharedMesh.blendShapeCount > 10)
                    {
                        faceRenderer = renderer;
                        break;
                    }
                }
            }
        }

        if (faceRenderer == null || faceRenderer.sharedMesh == null)
        {
            Debug.LogWarning("VRMModel: Face renderer not found. Please assign manually.");
            return;
        }

        var mesh = faceRenderer.sharedMesh;
        for (int i = 0; i < mesh.blendShapeCount; i++)
        {
            string name = mesh.GetBlendShapeName(i).ToLower();
            
            // VRoid naming convention: Fcl_MTH_A, Fcl_MTH_I, etc.
            if (name.Contains("mth_a") || name.Contains("mouth_a") || name == "a")
                mouthA = i;
            else if (name.Contains("mth_i") || name.Contains("mouth_i") || name == "i")
                mouthI = i;
            else if (name.Contains("mth_u") || name.Contains("mouth_u") || name == "u")
                mouthU = i;
            else if (name.Contains("mth_e") || name.Contains("mouth_e") || name == "e")
                mouthE = i;
            else if (name.Contains("mth_o") || name.Contains("mouth_o") || name == "o")
                mouthO = i;
        }

        Debug.Log($"VRMModel: Auto-detected blendshapes - A:{mouthA}, I:{mouthI}, U:{mouthU}, E:{mouthE}, O:{mouthO}");
    }

    /// <summary>
    /// Set mouth blendshape weights for lip sync.
    /// Values should be 0-1 range.
    /// </summary>
    public void SetMouthWeights(float a, float i, float u, float e, float o)
    {
        if (faceRenderer == null) return;

        // Convert 0-1 to 0-100 for blendshapes
        if (mouthA >= 0) faceRenderer.SetBlendShapeWeight(mouthA, a * 100f);
        if (mouthI >= 0) faceRenderer.SetBlendShapeWeight(mouthI, i * 100f);
        if (mouthU >= 0) faceRenderer.SetBlendShapeWeight(mouthU, u * 100f);
        if (mouthE >= 0) faceRenderer.SetBlendShapeWeight(mouthE, e * 100f);
        if (mouthO >= 0) faceRenderer.SetBlendShapeWeight(mouthO, o * 100f);
    }

    /// <summary>
    /// Reset all mouth blendshapes to closed position.
    /// </summary>
    public void ResetMouth()
    {
        SetMouthWeights(0, 0, 0, 0, 0);
    }

    /// <summary>
    /// Set a VRM expression preset (joy, angry, sorrow, fun, surprised, neutral).
    /// Requires UniVRM to be installed.
    /// </summary>
    public void SetExpression(string expressionName, float weight = 1.0f)
    {
#if VRM_INSTALLED
        if (vrmInstance != null && vrmInstance.Runtime != null)
        {
            var expressionKey = expressionName.ToLower() switch
            {
                "joy" or "happy" => ExpressionKey.Happy,
                "angry" => ExpressionKey.Angry,
                "sorrow" or "sad" => ExpressionKey.Sad,
                "fun" or "relaxed" => ExpressionKey.Relaxed,
                "surprised" => ExpressionKey.Surprised,
                _ => ExpressionKey.Neutral
            };
            
            vrmInstance.Runtime.Expression.SetWeight(expressionKey, weight);
        }
#else
        Debug.LogWarning("VRMModel: UniVRM not installed. Expression control disabled.");
#endif
    }

    /// <summary>
    /// Get face renderer for external lip sync systems.
    /// </summary>
    public SkinnedMeshRenderer GetFaceRenderer()
    {
        return faceRenderer;
    }

    /// <summary>
    /// Get mouth blendshape indices for external lip sync systems.
    /// Returns array: [A, I, U, E, O]
    /// </summary>
    public int[] GetMouthBlendshapeIndices()
    {
        return new int[] { mouthA, mouthI, mouthU, mouthE, mouthO };
    }
}
