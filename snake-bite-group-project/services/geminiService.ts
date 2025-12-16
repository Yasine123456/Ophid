// services/geminiService.ts (Web version)

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Simple image interface for web
interface SimpleImage {
  path: string;
  mime: string;
  type?: 'snake' | 'bite';
}

/**
 * Converts an image URI to a base64 string using web APIs.
 */
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to read image as data URL'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Runs inference using the Gemini model.
 * Supports: images only, description only, or both.
 *
 * @param images An array of image objects with path, mime, and type.
 * @param description The text description from the user.
 * @returns The scientific name of the identified snake species.
 */
export const runGeminiInference = async (
  images: SimpleImage[],
  description: string
): Promise<string | null> => {
  try {
    // Filter out invalid images (empty paths)
    const validImages = (images || []).filter(
      (img) => img && img.path && img.path.trim() !== ''
    );

    const hasImages = validImages.length > 0;
    const hasDescription = description && description.trim() !== '';

    console.log('Gemini inference starting...');
    console.log(`- Valid images: ${validImages.length}`);
    console.log(`- Has description: ${hasDescription}`);

    // Validate we have something to analyze
    if (!hasImages && !hasDescription) {
      throw new Error('No images or description provided for analysis');
    }

    // Build the prompt dynamically
    let promptText = `You are a world-class snake identification expert. Your task is to identify a snake species based on the information provided below.

`;

    if (hasImages) {
      const hasSnakePhoto = validImages.some((img) => img.type === 'snake');
      const hasBitePhoto = validImages.some((img) => img.type === 'bite');

      if (hasSnakePhoto && hasBitePhoto) {
        promptText += `You have been provided with two images: one showing the snake and one showing the bite wound. Analyze both images carefully.\n\n`;
      } else if (hasSnakePhoto) {
        promptText += `You have been provided with an image of the snake. Analyze its physical characteristics including color patterns, head shape, body shape, and any distinctive markings.\n\n`;
      } else if (hasBitePhoto) {
        promptText += `You have been provided with an image of a snake bite wound. While direct snake identification from bite marks alone is difficult, analyze the bite pattern and characteristics if possible.\n\n`;
      } else {
        promptText += `You have been provided with an image. Analyze it to identify the snake species.\n\n`;
      }
    }

    if (hasDescription) {
      promptText += `The user has provided the following description of the snake or encounter:
"${description.trim()}"

`;
    }

    if (!hasImages && hasDescription) {
      promptText += `Note: No images were provided. Base your identification solely on the written description above.\n\n`;
    }

    promptText += `CRITICAL INSTRUCTIONS:
1. Analyze all provided information carefully.
2. Identify the most likely snake species.
3. Your response must contain ONLY the scientific (Latin) name of the snake.
4. Do not include common names, explanations, danger assessments, or any other text.
5. If you cannot identify the species with reasonable confidence, respond with exactly: Unknown species

Examples of valid responses:
- Agkistrodon contortrix
- Crotalus atrox
- Thamnophis sirtalis
- Pantherophis obsoletus
- Unknown species`;

    // Build content parts array
    const contentParts: any[] = [{ text: promptText }];

    // Add images if available
    for (const image of validImages) {
      try {
        console.log(`Processing image: ${image.type || 'unknown type'}`);
        const base64Image = await imageToBase64(image.path);
        contentParts.push({
          inline_data: {
            mime_type: image.mime || 'image/jpeg',
            data: base64Image,
          },
        });
        console.log('Image added successfully');
      } catch (imageError) {
        console.warn('Failed to process image:', imageError);
        // Continue without this image
      }
    }

    // Prepare request body
    const requestBody = {
      contents: [{ parts: contentParts }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 100,
      },
    };

    console.log('Sending request to Gemini API...');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Extract the response text
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      // Check for safety blocks
      if (candidate.finishReason === 'SAFETY') {
        console.warn('Response blocked by safety filters');
        throw new Error(
          'Analysis blocked: The provided content may have violated safety policies.'
        );
      }

      const textContent = candidate.content?.parts?.[0]?.text;
      if (textContent) {
        const result = textContent.trim();
        console.log('Identified species:', result);
        return result;
      }
    }

    console.warn(
      'Unexpected Gemini response format:',
      JSON.stringify(data, null, 2)
    );
    return 'Unknown species';
  } catch (error) {
    console.error('Gemini inference failed:', error);
    throw error;
  }
};