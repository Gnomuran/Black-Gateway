/* eslint-disable consistent-return */
import express from 'express';
import asyncHandler from 'express-async-handler';
import fetch from 'node-fetch';

const router = express.Router();

// Using Hugging Face Inference API (free with rate limits)
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const { HUGGINGFACE_API_KEY } = process.env;

router.post(
  '/ask',
  asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${prompt} [/INST]`,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hugging Face API error response:', errorText);

        // Check if the model is still loading
        if (errorText.includes('loading')) {
          return res.status(503).json({
            error: 'The AI model is still loading. Please try again in a few moments.',
            isLoading: true,
          });
        }

        throw new Error(errorText || 'Failed to get response');
      }

      const data = await response.json();
      const answer = data[0]?.generated_text || '';

      // Extract only the assistant's response (remove the prompt)
      const cleanedAnswer = answer.replace(`<s>[INST] ${prompt} [/INST]`, '').trim();

      res.status(200).json({
        answer: cleanedAnswer,
      });
    } catch (error) {
      console.error('AI API error:', error);
      res.status(500).json({ error: error.message || 'Error processing your request' });
    }
  }),
);

// Fallback route for when the model is loading
router.post(
  '/retry',
  asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Simple fallback response when the model is loading
    res.status(200).json({
      answer: "I'm currently warming up. This is a simple response while my main AI brain gets ready. Please try asking your question again in a moment for a more detailed answer.",
      isLoading: true,
    });
  }),
);

export default router;
