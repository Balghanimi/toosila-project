const Anthropic = require('@anthropic-ai/sdk');

/**
 * Claude AI Service
 * Handles communication with Anthropic Claude API
 */

class ClaudeService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;

    if (!this.apiKey || this.apiKey === 'your-anthropic-api-key-here') {
      console.warn('⚠️  ANTHROPIC_API_KEY not found. AI moderation will be disabled.');
      this.enabled = false;
      this.client = null;
      this.model = null;
      this.maxTokens = null;
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: this.apiKey
      });
      this.enabled = true;
      this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1024');
      console.log('✅ Claude AI moderation enabled');
    } catch (error) {
      console.error('❌ Failed to initialize Claude client:', error);
      this.enabled = false;
      this.client = null;
    }
  }

  /**
   * Check if Claude service is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Send a moderation request to Claude
   * @param {string} systemPrompt - System instructions for Claude
   * @param {string} userMessage - Content to moderate
   * @param {object} metadata - Additional context
   * @returns {Promise<object>} Moderation result
   */
  async moderateContent(systemPrompt, userMessage, metadata = {}) {
    if (!this.enabled) {
      console.log('ℹ️  AI moderation disabled - auto-approving content');
      return {
        approved: true,
        flagged: false,
        rejected: false,
        reason: 'AI moderation disabled',
        confidence: 0
      };
    }

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      // Extract response text
      const responseText = message.content[0].text;

      // Parse JSON response
      try {
        const result = JSON.parse(responseText);
        return result;
      } catch (parseError) {
        console.error('❌ Failed to parse Claude response:', responseText);
        // Return safe default (flagged for manual review)
        return {
          approved: false,
          flagged: true,
          rejected: false,
          reason: 'Failed to parse AI response - requires manual review',
          confidence: 0,
          rawResponse: responseText
        };
      }

    } catch (error) {
      console.error('❌ Claude API error:', error);

      // On API error, flag for manual review (safe default)
      return {
        approved: false,
        flagged: true,
        rejected: false,
        reason: `AI service error: ${error.message}`,
        confidence: 0
      };
    }
  }

  /**
   * Get API usage statistics (if available)
   */
  async getUsageStats() {
    if (!this.enabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      model: this.model,
      maxTokens: this.maxTokens
    };
  }
}

// Export singleton instance
module.exports = new ClaudeService();
