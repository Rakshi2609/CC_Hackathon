// backend/services/aiService.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const LLM_API_KEY  = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.featherless.ai/v1';
const LLM_MODEL    = process.env.LLM_MODEL    || 'google/gemma-3-27b-it';

const VALID_CATEGORIES = ['Pothole', 'Streetlight', 'Garbage', 'Drainage', 'Water Leakage', 'Others'];

/**
 * Reads an image from disk and encodes it as a base64 data URL.
 */
function imageToBase64DataUrl(filePath) {
  const abs = path.resolve(filePath.replace(/^\//, ''));
  const buffer = fs.readFileSync(abs);
  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
             : ext === 'png' ? 'image/png'
             : ext === 'webp' ? 'image/webp'
             : 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

/**
 * Sends the citizen-uploaded image to Featherless.ai (vision model) and:
 *  1. Classifies which civic-issue category the image belongs to.
 *  2. Verifies whether it is a genuine real-world civic problem photo.
 *
 * @param {string} imageFilePath  - Relative path returned by multer (e.g. /uploads/issues/xxx.jpg)
 * @param {string} userCategory   - The category the citizen chose in the form
 * @returns {{ detectedCategory: string, aiVerified: boolean, confidence: number, aiNote: string }}
 */
export async function classifyIssueImage(imageFilePath, userCategory = '') {
  if (!LLM_API_KEY) {
    console.warn('[aiService] LLM_API_KEY not set — skipping AI classification.');
    return { detectedCategory: userCategory, aiVerified: false, confidence: 0, aiNote: 'AI key not configured.' };
  }

  let dataUrl;
  try {
    dataUrl = imageToBase64DataUrl(imageFilePath);
  } catch (err) {
    console.warn('[aiService] Could not read image file:', err.message);
    return { detectedCategory: userCategory, aiVerified: false, confidence: 0, aiNote: 'Image file unreadable.' };
  }

  const systemPrompt =
    `You are a civic issue classifier for a smart city platform. ` +
    `You will receive a photo uploaded by a citizen and must analyze it carefully. ` +
    `Respond ONLY with a valid JSON object — no markdown, no explanation, nothing else.`;

  const userPrompt =
    `Analyze this image and respond with a JSON object in exactly this format:
{
  "detectedCategory": "<one of: Pothole | Streetlight | Garbage | Drainage | Water Leakage | Others>",
  "aiVerified": <true if the image clearly shows a real civic problem, false if it looks fake/irrelevant>,
  "confidence": <integer 0-100 representing your confidence in the classification>,
  "aiNote": "<one sentence describing what you see in the image>"
}

Categories:
- Pothole: damaged/broken road surface, craters on road
- Streetlight: broken, missing, or non-functioning street/road lights
- Garbage: uncollected waste, overflowing bins, illegal dumping
- Drainage: blocked drains, open manholes, flooded gutters
- Water Leakage: burst pipes, water gushing/pooling from pipes, pipeline damage
- Others: any other civic infrastructure issue not in the above list

The citizen selected: "${userCategory || 'not specified'}"`;

  try {
    const response = await axios.post(
      `${LLM_BASE_URL}/chat/completions`,
      {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content || '';

    // Strip markdown code fences if the model wraps the JSON
    const cleaned = raw.replace(/```json|```/gi, '').trim();
    const parsed = JSON.parse(cleaned);

    const detectedCategory = VALID_CATEGORIES.includes(parsed.detectedCategory)
      ? parsed.detectedCategory
      : (userCategory || 'Others');

    return {
      detectedCategory,
      aiVerified: !!parsed.aiVerified,
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
      aiNote: parsed.aiNote || '',
    };
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error('[aiService] Classification failed:', msg);
    return {
      detectedCategory: userCategory || 'Others',
      aiVerified: false,
      confidence: 0,
      aiNote: `AI classification failed: ${msg}`,
    };
  }
}

// Legacy export kept for backward compatibility
export async function validateIssueImage(imageBuffer, category) {
  return { isReal: false, confidence: 0, description: 'Use classifyIssueImage() instead.' };
}
