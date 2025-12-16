// services/geminiService.native.ts
// Fixed version with correct expo-file-system import

import * as FileSystem from 'expo-file-system/legacy';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

interface AnalysisImage {
  path: string;
  mime: string;
  type?: 'snake' | 'bite';
}

/**
 * Converts an image URI to base64
 */
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    console.log('Converting image to base64...');
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });
    console.log('Image converted, length:', base64.length);
    return base64;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw error;
  }
};

/**
 * Runs inference using the Gemini API
 */
export const runGeminiInference = async (
  images: AnalysisImage[],
  description: string
): Promise<string | null> => {
  try {
    const validImages = (images || []).filter(
      (img) => img && img.path && img.path.trim() !== ''
    );

    const hasImages = validImages.length > 0;
    const hasDescription = description && description.trim() !== '';

    console.log('=== Gemini Inference ===');
    console.log(`Images: ${validImages.length}`);
    console.log(`Description: ${hasDescription ? 'Yes' : 'No'}`);

    if (!hasImages && !hasDescription) {
      throw new Error('No images or description provided');
    }

    // Build prompt
    let promptText = `You are a snake identification expert. Identify the snake species based on the provided information.

`;

    if (hasImages) {
      const hasSnakePhoto = validImages.some((img) => img.type === 'snake');
      const hasBitePhoto = validImages.some((img) => img.type === 'bite');

      if (hasSnakePhoto && hasBitePhoto) {
        promptText += `Two images provided: snake photo and bite wound.\n\n`;
      } else if (hasSnakePhoto) {
        promptText += `Image of the snake provided. Analyze color, pattern, head shape, body.\n\n`;
      } else if (hasBitePhoto) {
        promptText += `Image of bite wound provided.\n\n`;
      }
    }

    if (hasDescription) {
      promptText += `Description: "${description.trim()}"\n\n`;
    }

    if (!hasImages && hasDescription) {
      promptText += `No images provided. Use description only.\n\n`;
    }

    promptText += `INSTRUCTIONS:
1. Identify the most likely snake species.
2. Respond with ONLY the scientific (Latin) name.
3. No common names, explanations, or other text.
4. If uncertain, respond: Unknown species

Valid response examples:
- Agkistrodon contortrix
- Crotalus atrox
- Thamnophis sirtalis
- Unknown species`;

    // Build content parts
    const contentParts: any[] = [{ text: promptText }];

    // Add images
    let imagesAdded = 0;
    for (const image of validImages) {
      try {
        console.log(`Processing ${image.type || 'image'}...`);
        const base64Image = await imageToBase64(image.path);
        contentParts.push({
          inline_data: {
            mime_type: image.mime || 'image/jpeg',
            data: base64Image,
          },
        });
        imagesAdded++;
        console.log('Image added to request');
      } catch (imageError) {
        console.warn('Failed to process image:', imageError);
        // Fail if we expect images but couldn't load them
      }
    }

    if (hasImages && imagesAdded === 0) {
      throw new Error('Failed to process any of the provided images. Please try again.');
    }

    // Make API request
    const requestBody = {
      contents: [{ parts: contentParts }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 100,
      },
    };

    console.log('Sending to Gemini API...');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    if (data.candidates?.[0]) {
      const candidate = data.candidates[0];

      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Content blocked by safety filters');
      }

      const text = candidate.content?.parts?.[0]?.text;
      if (text) {
        const result = text.trim();
        console.log('Result:', result);
        return result;
      }
    }

    return 'Unknown species';
  } catch (error) {
    console.error('Gemini inference failed:', error);
    throw error;
  }
};