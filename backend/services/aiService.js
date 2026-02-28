// backend/services/aiService.js
import axios from 'axios';

/**
 * Validate an issue image using Gemini Vision API
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {string} category - The issue category (e.g., 'Pothole')
 * @returns {Promise<{isReal: boolean, confidence: number, description: string}>}
 */
export async function validateIssueImage(imageBuffer, category) {
    // Replace with your Gemini Vision API endpoint and key
    const GEMINI_API_URL = process.env.GEMINI_API_URL;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `Is this image a real-world photo of a ${category}? Respond with a JSON object: { "isReal": boolean, "confidence": number, "description": string }.`;

    const formData = new FormData();
    formData.append('image', imageBuffer, 'issue.jpg');
    formData.append('prompt', prompt);

    const headers = {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        ...formData.getHeaders(),
    };

    const response = await axios.post(GEMINI_API_URL, formData, { headers });
    // The Gemini API should return the JSON object in response.data
    return response.data;
}
