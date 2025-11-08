const claudeService = require('../services/claude.service');

/**
 * AI Moderation Agent
 * Uses Claude AI to moderate user-generated content (offers and demands)
 */

class ModerationAgent {
  constructor() {
    this.systemPrompt = `You are a content moderation AI for Toosila, an Iraqi ride-sharing platform.

Your role is to analyze ride offers and ride demands and determine if they are legitimate or should be flagged/rejected.

IMPORTANT CONTEXT:

1. IRAQI GEOGRAPHY:
   - This application covers ALL Iraqi cities, provinces, neighborhoods, districts, and areas
   - Users write location names in various formats (Arabic, English, colloquial, formal)
   - Common cities: Baghdad, Basra, Mosul, Erbil, Najaf, Karbala, Sulaymaniyah, Kirkuk, etc.
   - Common neighborhoods: Karada, Mansour, Adhamiya, Zubair, Ankawa, Kufa, etc.
   - ACCEPT any valid Iraqi location name - do NOT restrict to a fixed list
   - Be FLEXIBLE with spelling variations and transliterations
   - Focus on detecting fake/non-existent locations, not valid Iraqi places

2. PRICING CONTEXT (Iraqi Dinar - IQD):
   - Short trips (within city/same neighborhood): 2,000 - 15,000 IQD
   - Medium trips (between neighborhoods/nearby cities): 10,000 - 50,000 IQD
   - Long trips (between provinces/distant cities): 30,000 - 150,000 IQD
   - Very long trips (cross-country): 50,000 - 200,000 IQD
   - Prices vary based on distance, fuel costs, and demand
   - Be REASONABLE with price judgments - allow market flexibility

3. LANGUAGES:
   - Support Arabic (Iraqi dialect + Modern Standard Arabic)
   - Support English
   - Support mixed language (Arabizi)
   - Accept common spelling variations

4. WHAT TO DETECT:

   REJECT if:
   - Spam: Repeated identical posts, promotional ads, unrelated content
   - Fraud: Obvious scams, phishing attempts, fake payment schemes
   - Offensive: Hate speech, harassment, discriminatory language, explicit sexual content
   - Dangerous: Illegal activities, violence, weapons, drugs
   - Fake locations: Non-existent places (clearly made up, not just rare Iraqi locations)
   - Impossible routes: Routes that make no geographic sense
   - Extremely suspicious prices: 10x above or below reasonable range

   FLAG for manual review if:
   - Borderline pricing: Prices that seem high/low but not impossible
   - Unusual routes: Valid locations but uncommon combinations
   - Ambiguous content: Content that needs human judgment
   - Unclear locations: Spelling that could be typo or real place
   - Minor concerns: Small issues that don't warrant rejection

   APPROVE if:
   - Valid Iraqi locations (any city, town, neighborhood, district)
   - Reasonable pricing for the route distance
   - Clean, professional language
   - Clear ride details (pickup, destination, time, seats, price)
   - Normal ride-sharing request/offer

5. RESPONSE FORMAT:
   You must respond with valid JSON only:
   {
     "approved": boolean,
     "flagged": boolean,
     "rejected": boolean,
     "reason": "Brief explanation in English",
     "confidence": number (0-1),
     "issues": ["list", "of", "specific", "issues"],
     "suggestions": "Improvement suggestions if applicable"
   }

6. DECISION RULES:
   - approved=true, flagged=false, rejected=false → Content is clean, publish immediately
   - approved=false, flagged=true, rejected=false → Needs manual review
   - approved=false, flagged=false, rejected=true → Clear violation, block content
   - Only ONE of the three should be true

Be fair, context-aware, and err on the side of approval for legitimate Iraqi ride-sharing content.
Focus on protecting users from real harm (spam, fraud, abuse), not blocking valid requests.`;
  }

  /**
   * Analyze a ride offer for moderation
   * @param {object} offer - Offer data
   * @returns {Promise<object>} Moderation result
   */
  async analyzeOffer(offer) {
    if (!claudeService.isEnabled()) {
      return {
        approved: true,
        flagged: false,
        rejected: false,
        reason: 'AI moderation disabled - auto-approved',
        confidence: 0,
        moderatedBy: 'auto'
      };
    }

    const userMessage = `
Analyze this RIDE OFFER:

Pickup Location: ${offer.pickupLocation || 'N/A'}
Drop Location: ${offer.dropLocation || 'N/A'}
Date: ${offer.date || 'N/A'}
Time: ${offer.time || 'N/A'}
Price: ${offer.price || 'N/A'} IQD
Available Seats: ${offer.seats || 'N/A'}
${offer.description ? `Description: ${offer.description}` : ''}

Driver ID: ${offer.driverId || 'N/A'}

Determine if this offer should be approved, flagged, or rejected.
Respond with JSON only.
`;

    try {
      const result = await claudeService.moderateContent(
        this.systemPrompt,
        userMessage,
        {
          contentType: 'offer',
          contentId: offer.id
        }
      );

      return {
        ...result,
        moderatedBy: 'ai',
        moderatedAt: new Date()
      };

    } catch (error) {
      console.error('Moderation error for offer:', error);
      return {
        approved: false,
        flagged: true,
        rejected: false,
        reason: `Moderation error: ${error.message}`,
        confidence: 0,
        moderatedBy: 'error'
      };
    }
  }

  /**
   * Analyze a ride demand for moderation
   * @param {object} demand - Demand data
   * @returns {Promise<object>} Moderation result
   */
  async analyzeDemand(demand) {
    if (!claudeService.isEnabled()) {
      return {
        approved: true,
        flagged: false,
        rejected: false,
        reason: 'AI moderation disabled - auto-approved',
        confidence: 0,
        moderatedBy: 'auto'
      };
    }

    const userMessage = `
Analyze this RIDE REQUEST (Demand):

Pickup Location: ${demand.fromCity || 'N/A'}
Destination: ${demand.toCity || 'N/A'}
Earliest Time: ${demand.earliestTime || 'N/A'}
Latest Time: ${demand.latestTime || 'N/A'}
Max Budget: ${demand.budgetMax || 'N/A'} IQD
Passengers: ${demand.seats || 'N/A'}

Passenger ID: ${demand.passengerId || 'N/A'}

Determine if this demand should be approved, flagged, or rejected.
Respond with JSON only.
`;

    try {
      const result = await claudeService.moderateContent(
        this.systemPrompt,
        userMessage,
        {
          contentType: 'demand',
          contentId: demand.id
        }
      );

      return {
        ...result,
        moderatedBy: 'ai',
        moderatedAt: new Date()
      };

    } catch (error) {
      console.error('Moderation error for demand:', error);
      return {
        approved: false,
        flagged: true,
        rejected: false,
        reason: `Moderation error: ${error.message}`,
        confidence: 0,
        moderatedBy: 'error'
      };
    }
  }

  /**
   * Batch analyze multiple items
   * @param {Array} items - Array of offers or demands
   * @param {string} type - 'offer' or 'demand'
   * @returns {Promise<Array>} Array of moderation results
   */
  async analyzeBatch(items, type = 'offer') {
    const analyzeFunc = type === 'offer' ? this.analyzeOffer : this.analyzeDemand;

    const results = await Promise.all(
      items.map(item => analyzeFunc.call(this, item))
    );

    return results;
  }

  /**
   * Get moderation statistics
   * @param {Array} results - Array of moderation results
   * @returns {object} Statistics
   */
  getStats(results) {
    const total = results.length;
    const approved = results.filter(r => r.approved).length;
    const flagged = results.filter(r => r.flagged).length;
    const rejected = results.filter(r => r.rejected).length;

    return {
      total,
      approved,
      flagged,
      rejected,
      approvalRate: total > 0 ? (approved / total * 100).toFixed(2) : 0,
      flagRate: total > 0 ? (flagged / total * 100).toFixed(2) : 0,
      rejectRate: total > 0 ? (rejected / total * 100).toFixed(2) : 0
    };
  }
}

// Export singleton instance
module.exports = new ModerationAgent();
