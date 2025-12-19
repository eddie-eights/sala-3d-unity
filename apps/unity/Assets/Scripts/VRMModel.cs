using UnityEngine;
using System;
using System.Collections;

using UniVRM10;
using UniGLTF;

/// <summary>
/// VRMModel handles VRoid model loading and blendshape control.
/// Provides access to VRM expression presets and mouth blendshapes for lip sync.
/// </summary>
public class VRMModel : MonoBehaviour
{
    public static VRMModel Instance { get; private set; }

    [Header("VRM Components")]
    [SerializeField] private Vrm10Instance vrmInstance;
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

        // Auto-detect Vrm10Instance if not assigned
        if (vrmInstance == null)
        {
            vrmInstance = GetComponent<Vrm10Instance>();
            if (vrmInstance == null)
            {
                vrmInstance = GetComponentInParent<Vrm10Instance>();
            }
            if (vrmInstance == null)
            {
                vrmInstance = GetComponentInChildren<Vrm10Instance>();
            }
            
            if (vrmInstance != null)
            {

            }
            else
            {
                Debug.LogWarning("VRMModel: Vrm10Instance not found. VRM Expression API will not work.");
            }
        }

        AutoDetectBlendshapes();
    }

    /// <summary>
    /// Automatically detect VRM mouth blendshapes from the face mesh.
    /// VRoid models typically use: Fcl_MTH_A, Fcl_MTH_I, Fcl_MTH_U, Fcl_MTH_E, Fcl_MTH_O
    /// </summary>
    private void AutoDetectBlendshapes()
    {
        // ALWAYS search for Face by name to avoid serialization issues in WebGL
        // The serialized reference from Editor may not point to the same instance at runtime

        
        // Try to find by name first (more reliable in WebGL)
        GameObject faceObj = GameObject.Find("Face");
        if (faceObj != null)
        {
            var renderer = faceObj.GetComponent<SkinnedMeshRenderer>();
            if (renderer != null && renderer.sharedMesh != null && renderer.sharedMesh.blendShapeCount > 0)
            {
                faceRenderer = renderer;
            }
        }
        
        // Fallback to searching in children
        if (faceRenderer == null)
        {
            Debug.Log($"VRMModel: Face not found by name, searching in children of {gameObject.name}...");
            var renderers = GetComponentsInChildren<SkinnedMeshRenderer>();
            
            foreach (var renderer in renderers)
            {
                if (renderer.sharedMesh != null && renderer.sharedMesh.blendShapeCount > 0)
                {
                    faceRenderer = renderer;
                    break;
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


    }

    /// <summary>
    /// Set mouth blendshape weights for lip sync.
    /// Values should be 0-1 range.
    /// </summary>
    public void SetMouthWeights(float a, float i, float u, float e, float o)
    {



        // Use VRM SDK Expression API - this is the ONLY way to control mouth in VRM 1.0
        if (vrmInstance != null && vrmInstance.Runtime != null && vrmInstance.Runtime.Expression != null)
        {
            var expression = vrmInstance.Runtime.Expression;
            
            // VRM 1.0 manages expressions through a central system
            // We need to set individual blendshapes through the expression manager
            try
            {
                // Set mouth shapes - VRM uses 0-1 range
                // These correspond to the Fcl_MTH_* blendshapes
                if (mouthA >= 0) expression.SetWeight(ExpressionKey.Aa, a);
                if (mouthI >= 0) expression.SetWeight(ExpressionKey.Ih, i);
                if (mouthU >= 0) expression.SetWeight(ExpressionKey.Ou, u);
                if (mouthE >= 0) expression.SetWeight(ExpressionKey.Ee, e);
                if (mouthO >= 0) expression.SetWeight(ExpressionKey.Oh, o);
                

                return;
            }
            catch (System.Exception ex)
            {
                Debug.LogWarning($"VRMModel: Failed to use VRM Expression API: {ex.Message}. Falling back to direct manipulation.");
            }
        }


        // Fallback: Direct blendshape manipulation (won't work if VRM Runtime is active)
        if (faceRenderer == null)
        {
            Debug.LogWarning("VRMModel: faceRenderer is null in SetMouthWeights!");
            return;
        }

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
