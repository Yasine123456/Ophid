// services/modelService.native.ts (Native version - ONNX with Gemini fallback)
// Attempts to use local ONNX models, falls back to Gemini API if unavailable

import { runGeminiInference } from './geminiService.native';
import { Alert } from 'react-native';

// Simple image interface
interface AnalysisImage {
  path: string;
  mime: string;
  type?: 'snake' | 'bite';
}

// State
let useGeminiFallback = false;
let modelsLoaded = false;
let userNotified = false;

// Callback for notifying the app about fallback status
let onFallbackActivated: ((reason: string) => void) | null = null;

/**
 * Register a callback to be notified when fallback is activated
 */
export const setFallbackCallback = (callback: (reason: string) => void): void => {
  onFallbackActivated = callback;
};

/**
 * Returns the current inference type.
 */
export const getInferenceType = (): 'gemini' | 'native' => {
  return useGeminiFallback ? 'gemini' : 'native';
};

/**
 * Returns whether we're using the fallback
 */
export const isUsingFallback = (): boolean => {
  return useGeminiFallback;
};

/**
 * Forcefully enable fallback mode (e.g. for Expo Go)
 */
export const enableFallbackMode = (reason: string = 'Forced fallback'): void => {
  console.log('Forcing fallback mode:', reason);
  useGeminiFallback = true;
  modelsLoaded = true;
  // We don't set userNotified here so that the UI can still decide to show the popup
  // or we can let the UI show it manually.
};

/**
 * Show alert to user about fallback mode
 */
const notifyUserAboutFallback = (reason: string): void => {
  if (userNotified) return;
  userNotified = true;

  // Notify via callback if registered
  if (onFallbackActivated) {
    onFallbackActivated(reason);
  }

  // Also show an alert
  Alert.alert(
    '☁️ Cloud Mode Active',
    `The app couldn't load on-device AI models and will use cloud-based analysis instead.\n\nReason: ${reason}\n\nYou'll need an internet connection for snake identification to work.`,
    [
      {
        text: 'I Understand',
        style: 'default',
      },
    ],
    { cancelable: true }
  );
};

/**
 * Attempts to load ONNX runtime and models.
 * Falls back to Gemini if anything fails.
 */
export const loadModels = async (): Promise<void> => {
  if (modelsLoaded) {
    console.log('Models already loaded or fallback active.');
    return;
  }

  console.log('Attempting to load on-device AI models...');

  try {
    // Step 0: Check if running in Expo Go
    // Native modules (onnxruntime-react-native, react-native-fs) are NOT supported in Expo Go.
    // We explicitly check for this to avoid the "Invariant Violation" RedBox errors.
    const Constants = (await import('expo-constants')).default;
    const isExpoGo = Constants.appOwnership === 'expo';

    if (isExpoGo) {
      console.log('Detected Expo Go environment. Native models are not supported.');
      throw new Error('Native modules incompatible with Expo Go (requires development build)');
    }

    // Step 1: Try to dynamically import ONNX runtime
    console.log('Loading ONNX runtime...');
    const onnxRuntime = await import('onnxruntime-react-native');

    // Step 2: Try to dynamically import react-native-fs
    const RNFS = await import('react-native-fs');

    // Model paths
    const modelDir = `${RNFS.default.MainBundlePath}/assets/ml`;
    const visionEncoderPath = `${modelDir}/vision_encoder.onnx`;
    const embedTokensPath = `${modelDir}/embed_tokens.onnx`;
    const decoderPath = `${modelDir}/decoder_model_merged.onnx`;

    // Step 3: Check if model files exist
    console.log('Checking model files...');
    const visionExists = await RNFS.default.exists(visionEncoderPath);
    const embedExists = await RNFS.default.exists(embedTokensPath);
    const decoderExists = await RNFS.default.exists(decoderPath);

    const missingFiles = [];
    if (!visionExists) missingFiles.push('vision_encoder.onnx');
    if (!embedExists) missingFiles.push('embed_tokens.onnx');
    if (!decoderExists) missingFiles.push('decoder_model_merged.onnx');

    if (missingFiles.length > 0) {
      throw new Error(`Model files not found: ${missingFiles.join(', ')}`);
    }

    // Step 4: Load the ONNX sessions
    console.log('Creating inference sessions...');
    const { InferenceSession } = onnxRuntime;

    await Promise.all([
      InferenceSession.create(visionEncoderPath),
      InferenceSession.create(embedTokensPath),
      InferenceSession.create(decoderPath),
    ]);

    console.log('ONNX sessions created successfully!');

    // Step 5: The @xenova/transformers processor won't work in React Native
    // This is a known limitation - Hermes doesn't support import.meta
    throw new Error('Tokenizer/processor incompatible with React Native runtime');

  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';

    // Don't log full error stack for expected Expo Go incompatibility
    if (errorMessage.includes('Expo Go')) {
      console.log('Native loading skipped (Expo Go detected).');
    } else {
      console.error('Failed to load on-device models:', errorMessage);
    }

    console.log('Activating Gemini API fallback...');

    useGeminiFallback = true;
    modelsLoaded = true;

    // Determine user-friendly reason
    let userReason = 'Model loading failed';
    if (errorMessage.includes('not found')) {
      userReason = 'AI model files not installed';
    } else if (errorMessage.includes('incompatible')) {
      userReason = 'AI models not compatible with this device';
    } else if (errorMessage.includes('import')) {
      userReason = 'Required components unavailable';
    } else if (errorMessage.includes('Expo Go')) {
      userReason = 'Running in Expo Go (cloud mode only)';
    }

    // Notify user
    notifyUserAboutFallback(userReason);
  }
};

/**
 * Runs inference - uses ONNX if available, otherwise Gemini.
 */
export const runInference = async (
  images: AnalysisImage[],
  description: string
): Promise<string | null> => {
  // Ensure models are loaded/fallback is set
  if (!modelsLoaded) {
    await loadModels();
  }

  const validImages = (images || []).filter(
    (img) => img && img.path && img.path.trim() !== ''
  );
  const hasDescription = description && description.trim() !== '';

  console.log('=== Native Inference Started ===');
  console.log(`Valid images: ${validImages.length}, Has description: ${hasDescription}`);
  console.log(`Using Gemini fallback: ${useGeminiFallback}`);

  // Validate inputs
  if (validImages.length === 0 && !hasDescription) {
    throw new Error('Please provide at least one image or a description for analysis.');
  }

  // Always use Gemini in fallback mode
  if (useGeminiFallback) {
    console.log('Using Gemini API for inference...');
    return runGeminiInference(validImages as any, description);
  }

  // Native inference path (currently not reachable due to processor limitations)
  // If you implement a custom tokenizer in the future, this is where it would go
  console.log('Attempting native inference...');
  try {
    // Placeholder for future native implementation
    throw new Error('Native inference not yet implemented');
  } catch (error) {
    console.error('Native inference failed, using Gemini:', error);
    return runGeminiInference(validImages as any, description);
  }
};

/**
 * Releases model resources.
 */
export const closeModels = async (): Promise<void> => {
  modelsLoaded = false;
  useGeminiFallback = false;
  userNotified = false;
  console.log('Model resources released.');
};