// services/modelService.ts (Web version - uses Gemini API)
import { runGeminiInference } from './geminiService';

// Simple image interface
interface SimpleImage {
  path: string;
  mime: string;
  type?: 'snake' | 'bite';
}

// Callback placeholder for interface compatibility
type FallbackCallback = (reason: string) => void;
let onFallbackActivated: FallbackCallback | null = null;

/**
 * Register a callback (not used on web)
 */
export const setFallbackCallback = (callback: FallbackCallback): void => {
  onFallbackActivated = callback;
};

/**
 * Returns the inference type - always 'gemini' for web
 */
export const getInferenceType = (): 'gemini' | 'native' => {
  return 'gemini';
};

/**
 * Returns whether we're using the fallback
 */
export const isUsingFallback = (): boolean => {
  return false; // Web always uses Gemini as primary
};

/**
 * Get fallback reason (empty on web)
 */
export const getFallbackReason = (): string => {
  return '';
};

/**
 * Load models - no-op on web
 */
export const loadModels = async (): Promise<void> => {
  console.log('Web platform: Using Gemini API for inference.');
  return Promise.resolve();
};

/**
 * Runs inference using Gemini API
 */
export const runInference = async (
  images: SimpleImage[],
  description: string
): Promise<string | null> => {
  console.log('=== Web Inference Started ===');
  console.log(`Images: ${images?.length || 0}`);
  console.log(`Description: ${description ? 'Yes' : 'No'}`);

  const validImages = (images || []).filter(
    (img) => img && img.path && img.path.trim() !== ''
  );

  const hasDescription = description && description.trim() !== '';

  if (validImages.length === 0 && !hasDescription) {
    throw new Error('Please provide at least one image or a description for analysis.');
  }

  try {
    console.log('Calling Gemini API...');
    const result = await runGeminiInference(validImages as any, description || '');

    if (result) {
      console.log('Inference successful:', result);
      return result;
    } else {
      return 'Unknown species';
    }
  } catch (error) {
    console.error('Inference failed:', error);
    throw error;
  }
};

/**
 * Close models - no-op on web
 */
export const closeModels = async (): Promise<void> => {
  console.log('Web: No resources to release.');
  return Promise.resolve();
};