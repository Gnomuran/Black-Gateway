/* eslint-disable camelcase */
// server/src/api/routes/ai-assistant.js
import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { query } from '../../../boilerplate/db/index.js';

const router = express.Router();

// Rate limiting for AI assistant
const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.AI_ASSISTANT_RATE_LIMIT) || 60,
  message: {
    error: 'Too many AI requests. Please wait a moment before asking again.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OpenRouter API configuration
const OPENROUTER_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-distill-llama-70b',
  systemPrompt: process.env.AI_SYSTEM_PROMPT || `You are a highly knowledgeable physics AI assistant specializing in quantum mechanics, relativity, black holes, particle physics, and astrophysics. 

Your expertise includes:
- Quantum mechanics and quantum field theory
- Einstein's theories of special and general relativity
- Black hole physics and cosmology
- Particle physics and the Standard Model
- Mathematical physics and advanced equations
- Current research and recent discoveries

Guidelines for responses:
1. Provide accurate, detailed explanations
2. Include relevant mathematical formulations when appropriate
3. Use proper physics terminology and notation
4. Cite relevant physics principles and equations
5. Explain complex concepts in an accessible way
6. When unsure, acknowledge limitations and suggest authoritative sources
7. Always maintain scientific accuracy over speculation
8. Reference previous parts of our conversation when relevant

Format equations using standard mathematical notation and explain their significance.`,
};

// DeepSeek R1 API client with conversation context
class DeepSeekClient {
  constructor() {
    this.apiKey = OPENROUTER_CONFIG.apiKey;
    this.baseURL = OPENROUTER_CONFIG.baseURL;
    this.model = OPENROUTER_CONFIG.model;
    this.systemPrompt = OPENROUTER_CONFIG.systemPrompt;

    if (!this.apiKey) {
      console.error('⚠️ OPENROUTER_API_KEY not found in environment variables');
    } else {
      console.log('✅ DeepSeek R1 client initialized successfully');
      console.log('📊 Model:', this.model);
    }
  }

  async generateResponse(userMessage, conversationHistory = [], context = {}) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      console.log('🤖 Sending request to DeepSeek R1 via OpenRouter');
      console.log('📝 Message length:', userMessage.length);
      console.log('📚 Conversation history length:', conversationHistory.length);
      console.log('🎯 Model:', this.model);

      // Build messages array with conversation history
      const messages = [
        {
          role: 'system',
          content: this.systemPrompt,
        }
      ];

      // Add conversation history (last 20 messages to avoid token limits)
      const recentHistory = conversationHistory.slice(-20);
      messages.push(...recentHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })));

      // Add current user message
      messages.push({
        role: 'user',
        content: this.enhanceUserMessage(userMessage, context),
      });

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages,
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Black Gateway Physics AI Assistant',
          },
          timeout: 30000,
        },
      );

      const aiResponse = response.data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response content from DeepSeek R1');
      }

      console.log('✅ DeepSeek R1 response received successfully');
      console.log('📏 Response length:', aiResponse.length);
      console.log('💰 Token usage:', JSON.stringify(response.data.usage));

      return {
        content: aiResponse,
        model: this.model,
        usage: response.data.usage,
        timestamp: new Date().toISOString(),
        source: 'deepseek-r1',
      };
    } catch (error) {
      console.error('❌ DeepSeek R1 API Error:', error.message);

      if (error.response) {
        console.error('📊 Response status:', error.response.status);
        console.error('📋 Response data:', error.response.data);

        if (error.response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before asking again.');
        } else if (error.response.status === 401) {
          throw new Error('API authentication failed. Please check your API key.');
        } else if (error.response.status === 400) {
          throw new Error('Invalid request format. Please try rephrasing your question.');
        } else if (error.response.status === 503) {
          throw new Error('DeepSeek R1 service temporarily unavailable. Please try again in a moment.');
        }
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The AI is taking too long to respond.');
      }

      throw error;
    }
  }

  enhanceUserMessage(message, context) {
    let enhancedMessage = message;

    if (context.username) {
      enhancedMessage = `User ${context.username} asks: ${message}`;
    }

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('equation') || lowerMessage.includes('formula')) {
      enhancedMessage += '\n\nPlease include relevant mathematical equations and explain their significance using proper mathematical notation.';
    }

    if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      enhancedMessage += '\n\nPlease provide a clear, detailed explanation suitable for someone learning physics.';
    }

    if (lowerMessage.includes('example') || lowerMessage.includes('demonstrate')) {
      enhancedMessage += '\n\nPlease include concrete examples to illustrate the concepts.';
    }

    if (lowerMessage.includes('derive') || lowerMessage.includes('derivation')) {
      enhancedMessage += '\n\nPlease show the mathematical derivation step by step.';
    }

    return enhancedMessage;
  }

  async testConnection() {
    try {
      const testResponse = await this.generateResponse('What is physics?', [], { test: true });
      return {
        success: true,
        model: testResponse.model,
        responseLength: testResponse.content.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Initialize DeepSeek client
const deepseekClient = new DeepSeekClient();

// Conversation Management Functions
const createConversation = async (userId, title = 'New Chat') => {
  const { rows } = await query(
    'INSERT INTO ai_chat_conversations (user_id, title) VALUES ($1, $2) RETURNING *',
    [userId, title]
  );
  return rows[0];
};

const getConversations = async (userId) => {
  const { rows } = await query(
    `SELECT * FROM ai_chat_conversation_summaries 
     WHERE user_id = $1 AND is_archived = false 
     ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
};

const getConversation = async (conversationId, userId) => {
  const { rows } = await query(
    'SELECT * FROM ai_chat_conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  return rows[0];
};

const getConversationMessages = async (conversationId, userId) => {
  // Verify user owns the conversation
  const conversation = await getConversation(conversationId, userId);
  if (!conversation) {
    throw new Error('Conversation not found or access denied');
  }

  const { rows } = await query(
    `SELECT id, role, content, metadata, tokens_used, model_used, created_at 
     FROM ai_chat_messages 
     WHERE conversation_id = $1 
     ORDER BY created_at ASC`,
    [conversationId]
  );
  return rows;
};

const addMessage = async (conversationId, role, content, metadata = {}, tokensUsed = 0, modelUsed = null) => {
  const { rows } = await query(
    `INSERT INTO ai_chat_messages (conversation_id, role, content, metadata, tokens_used, model_used) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [conversationId, role, content, JSON.stringify(metadata), tokensUsed, modelUsed]
  );
  return rows[0];
};

const updateConversationTitle = async (conversationId, userId, title) => {
  const { rows } = await query(
    'UPDATE ai_chat_conversations SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [title, conversationId, userId]
  );
  return rows[0];
};

const deleteConversation = async (conversationId, userId) => {
  const { rows } = await query(
    'DELETE FROM ai_chat_conversations WHERE id = $1 AND user_id = $2 RETURNING *',
    [conversationId, userId]
  );
  return rows[0];
};

// Generate conversation title from first message
const generateConversationTitle = (firstMessage) => {
  const words = firstMessage.trim().split(' ').slice(0, 6);
  let title = words.join(' ');
  if (firstMessage.length > title.length) {
    title += '...';
  }
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
};

// Fallback responses
const fallbackResponses = {
  quantum: [
    'Quantum mechanics is the fundamental theory describing nature at the smallest scales. Key principles include wave-particle duality, the uncertainty principle (Δx·Δp ≥ ℏ/2), and quantum superposition. The Schrödinger equation (iℏ ∂ψ/∂t = Ĥψ) governs the evolution of quantum systems.',
  ],
  relativity: [
    "Einstein's special relativity is based on two postulates: the laws of physics are identical in all inertial reference frames, and the speed of light in vacuum is constant for all observers. This leads to time dilation (Δt' = γΔt) and the famous mass-energy equivalence E = mc².",
  ],
  'black hole': [
    'Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. The Schwarzschild radius rs = 2GM/c² defines this boundary for non-rotating black holes.',
  ],
};

const generateFallbackResponse = (message, context = {}) => {
  const lowerMessage = message.toLowerCase();

  for (const [topic, responses] of Object.entries(fallbackResponses)) {
    if (lowerMessage.includes(topic)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    const greeting = context.username ? `Hello ${context.username}!` : 'Hello!';
    return `${greeting} I'm your AI Physics Assistant. I'm currently running in offline mode, but I can still help with quantum mechanics, relativity, black holes, particle physics, and more. What would you like to explore?`;
  }

  return "I'm here to help with physics questions! I can discuss quantum mechanics, relativity, black holes, particle physics, mathematical physics, and more. What physics topic would you like to explore today?";
};

// Statistics tracking
let statistics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokensUsed: 0,
  averageResponseTime: 0,
  topicCounts: {},
  errorCounts: {},
};

const updateStatistics = (success, responseTime, tokens = 0, topic = 'general', error = null) => {
  statistics.totalRequests++;

  if (success) {
    statistics.successfulRequests++;
    statistics.totalTokensUsed += tokens;
  } else {
    statistics.failedRequests++;
    if (error) {
      statistics.errorCounts[error] = (statistics.errorCounts[error] || 0) + 1;
    }
  }

  statistics.averageResponseTime = (
    (statistics.averageResponseTime * (statistics.totalRequests - 1) + responseTime)
    / statistics.totalRequests
  );

  statistics.topicCounts[topic] = (statistics.topicCounts[topic] || 0) + 1;
};

// Chat API Endpoints

// Create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title } = req.body;
    const conversation = await createConversation(userId, title);

    res.json({
      conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get all conversations for user
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const conversations = await getConversations(userId);

    res.json({
      conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get specific conversation with messages
router.get('/conversations/:id', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const conversationId = req.params.id;
    const conversation = await getConversation(conversationId, userId);
    const messages = await getConversationMessages(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversation,
      messages
    });
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Update conversation title
router.put('/conversations/:id', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const conversationId = req.params.id;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const conversation = await updateConversationTitle(conversationId, userId, title.trim());

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversation,
      message: 'Conversation title updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Delete conversation
router.delete('/conversations/:id', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const conversationId = req.params.id;
    const conversation = await deleteConversation(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Main chat endpoint with conversation context
router.post('/chat', aiRateLimit, async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, conversationId, context = {} } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required',
        code: 'EMPTY_MESSAGE',
      });
    }

    const maxLength = parseInt(process.env.AI_ASSISTANT_MAX_MESSAGE_LENGTH) || 2000;
    if (message.length > maxLength) {
      return res.status(400).json({
        error: `Message too long. Please keep it under ${maxLength} characters.`,
        code: 'MESSAGE_TOO_LONG',
        maxLength,
      });
    }

    let conversation;
    let conversationHistory = [];

    // Handle conversation
    if (conversationId) {
      // Use existing conversation
      conversation = await getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      conversationHistory = await getConversationMessages(conversationId, userId);
    } else {
      // Create new conversation
      const title = generateConversationTitle(message);
      conversation = await createConversation(userId, title);
    }

    // Add user message to database
    await addMessage(conversation.id, 'user', message.trim(), context);

    // Get user context
    const userContext = {
      username: req.session?.user?.username,
      userId: req.session?.user?.id,
      timestamp: new Date().toISOString(),
      conversationId: conversation.id,
      ...context,
    };

    console.log('🎯 AI Chat request received:', {
      messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      conversationId: conversation.id,
      historyLength: conversationHistory.length,
      userContext: {
        username: userContext.username,
        userId: userContext.userId,
      },
    });

    let aiResponse;
    let responseMetadata = {};
    let success = true;

    try {
      // Get response from DeepSeek R1 with conversation history
      console.log('🚀 Attempting DeepSeek R1 API call with conversation context...');
      const deepseekResponse = await deepseekClient.generateResponse(message, conversationHistory, userContext);

      aiResponse = deepseekResponse.content;
      responseMetadata = {
        model: deepseekResponse.model,
        usage: deepseekResponse.usage,
        source: 'deepseek-r1',
        timestamp: deepseekResponse.timestamp,
      };

      console.log('✅ DeepSeek R1 response successful');
    } catch (apiError) {
      console.warn('⚠️ DeepSeek R1 API failed, using fallback response');
      console.warn('🔍 Error details:', apiError.message);

      success = false;
      aiResponse = generateFallbackResponse(message, userContext);
      responseMetadata = {
        source: 'local-fallback',
        fallbackReason: apiError.message,
        timestamp: new Date().toISOString(),
      };
    }

    // Add AI response to database
    await addMessage(
      conversation.id, 
      'assistant', 
      aiResponse, 
      responseMetadata,
      responseMetadata.usage?.total_tokens || 0,
      responseMetadata.model || 'fallback'
    );

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Detect topic for statistics
    const topic = detectTopic(message);

    // Update statistics
    updateStatistics(
      success,
      responseTime,
      responseMetadata.usage?.total_tokens || 0,
      topic,
      success ? null : responseMetadata.fallbackReason,
    );

    // Send response
    res.json({
      response: aiResponse,
      conversationId: conversation.id,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      metadata: responseMetadata,
      context: {
        category: 'physics',
        model: responseMetadata.source === 'deepseek-r1' ? 'DeepSeek R1' : 'Local Fallback',
        topic,
      },
    });

    console.log(`✅ Response sent successfully in ${responseTime}ms`);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ AI Assistant endpoint error:', error);

    updateStatistics(false, responseTime, 0, 'error', error.message);

    res.status(500).json({
      error: 'Failed to generate AI response',
      message: 'I apologize, but I encountered an error while processing your question. Please try again in a moment.',
      timestamp: new Date().toISOString(),
      code: 'INTERNAL_ERROR',
    });
  }
});

// Topic detection helper
const detectTopic = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('quantum')) return 'quantum_mechanics';
  if (lowerMessage.includes('relativity') || lowerMessage.includes('einstein')) return 'relativity';
  if (lowerMessage.includes('black hole')) return 'black_holes';
  if (lowerMessage.includes('particle') || lowerMessage.includes('standard model')) return 'particle_physics';
  if (lowerMessage.includes('equation') || lowerMessage.includes('formula')) return 'mathematics';
  if (lowerMessage.includes('cosmology') || lowerMessage.includes('universe')) return 'cosmology';

  return 'general_physics';
};

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const connectionTest = await deepseekClient.testConnection();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        model: OPENROUTER_CONFIG.model,
        apiConfigured: !!OPENROUTER_CONFIG.apiKey,
        rateLimitEnabled: true,
        maxMessageLength: parseInt(process.env.AI_ASSISTANT_MAX_MESSAGE_LENGTH) || 2000,
      },
      connection: connectionTest,
      statistics: {
        totalRequests: statistics.totalRequests,
        successRate: statistics.totalRequests > 0
          ? `${(statistics.successfulRequests / statistics.totalRequests * 100).toFixed(2)}%` : '0%',
        averageResponseTime: `${Math.round(statistics.averageResponseTime)}ms`,
      },
    };

    res.json(health);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Other existing endpoints (test, model-info, usage, etc.) remain the same...
router.get('/model-info', (req, res) => {
  res.json({
    model: OPENROUTER_CONFIG.model,
    provider: 'OpenRouter',
    description: 'DeepSeek R1 - Advanced reasoning AI model for physics and mathematics',
    capabilities: [
      'Advanced physics reasoning',
      'Mathematical problem solving',
      'Equation derivation and explanation',
      'Scientific concept explanation',
      'Quantum mechanics expertise',
      'Relativity theory knowledge',
      'Black hole physics',
      'Particle physics understanding',
      'Conversation memory and context',
    ],
    configured: !!OPENROUTER_CONFIG.apiKey,
    status: OPENROUTER_CONFIG.apiKey ? 'active' : 'inactive',
  });
});

export default router;