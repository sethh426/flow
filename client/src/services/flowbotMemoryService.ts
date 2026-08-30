/**
 * FlowBot Long-Term Memory Service
 * Stores conversation context, preferences, and business knowledge across sessions
 * Enables FlowBot to remember each user and provide personalized assistance
 */

import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
}

export interface UserPreferences {
  communicationStyle?: 'casual' | 'professional' | 'technical';
  automationLevel?: 'full-auto' | 'notify-first' | 'require-approval' | 'manual';
  preferredPlatforms?: string[];
  contentTypes?: string[];
  timezone?: string;
  workingHours?: { start: string; end: string };
  notifications?: {
    email?: boolean;
    push?: boolean;
    frequency?: 'realtime' | 'daily' | 'weekly';
  };
}

export interface BusinessKnowledge {
  niche?: string;
  targetAudience?: string;
  brandVoice?: string;
  brandColors?: string[];
  successfulTactics?: string[];
  failedTactics?: string[];
  competitorInsights?: string[];
  seasonalPatterns?: Record<string, string>;
  products?: {
    topSelling?: string[];
    underperforming?: string[];
    averagePrice?: number;
  };
}

export interface Learnings {
  bestPostingTimes?: Date[];
  topPerformingContentTypes?: string[];
  optimalBudgetAllocation?: Record<string, number>;
  engagementPatterns?: Record<string, number>;
  conversionOptimizations?: string[];
  lastUpdated?: Date;
}

export interface FlowBotMemory {
  userId: string;
  recentConversations: ConversationMessage[];
  preferences: UserPreferences;
  businessKnowledge: BusinessKnowledge;
  learnings: Learnings;
  quickFacts: Record<string, any>;
  goals: string[];
  achievements: string[];
  createdAt: Date;
  lastInteraction: Date;
  totalInteractions: number;
}

// ============================================================================
// MEMORY SERVICE
// ============================================================================

export class FlowBotMemoryService {
  private memoryCollection = 'flowbot_memory';
  private conversationLimit = 50; // Keep last 50 messages

  /**
   * Get user's FlowBot memory
   */
  async getMemory(userId: string): Promise<FlowBotMemory | null> {
    try {
      const memoryRef = doc(db, this.memoryCollection, userId);
      const memoryDoc = await getDoc(memoryRef);

      if (memoryDoc.exists()) {
        const data = memoryDoc.data();
        return {
          ...data,
          recentConversations: data.recentConversations?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate(),
          })) || [],
          learnings: {
            ...data.learnings,
            lastUpdated: data.learnings?.lastUpdated?.toDate(),
          },
          createdAt: data.createdAt?.toDate(),
          lastInteraction: data.lastInteraction?.toDate(),
        } as FlowBotMemory;
      }

      // Initialize new memory
      return this.initializeMemory(userId);
    } catch (error) {
      console.error('Error getting FlowBot memory:', error);
      return null;
    }
  }

  /**
   * Initialize new memory for user
   */
  private async initializeMemory(userId: string): Promise<FlowBotMemory> {
    const memory: FlowBotMemory = {
      userId,
      recentConversations: [],
      preferences: {
        communicationStyle: 'casual',
        automationLevel: 'notify-first',
        preferredPlatforms: [],
        contentTypes: [],
      },
      businessKnowledge: {},
      learnings: {},
      quickFacts: {},
      goals: [],
      achievements: [],
      createdAt: new Date(),
      lastInteraction: new Date(),
      totalInteractions: 0,
    };

    const memoryRef = doc(db, this.memoryCollection, userId);
    await setDoc(memoryRef, {
      ...memory,
      createdAt: Timestamp.fromDate(memory.createdAt),
      lastInteraction: Timestamp.fromDate(memory.lastInteraction),
    });

    return memory;
  }

  /**
   * Save conversation message
   */
  async saveConversation(userId: string, role: 'user' | 'assistant', content: string, action?: string): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      const message: ConversationMessage = {
        role,
        content,
        timestamp: new Date(),
        action,
      };

      // Add new message
      memory.recentConversations.push(message);

      // Keep only last N messages
      if (memory.recentConversations.length > this.conversationLimit) {
        memory.recentConversations = memory.recentConversations.slice(-this.conversationLimit);
      }

      // Update memory
      const memoryRef = doc(db, this.memoryCollection, userId);
      await updateDoc(memoryRef, {
        recentConversations: memory.recentConversations.map(msg => ({
          ...msg,
          timestamp: Timestamp.fromDate(msg.timestamp),
        })),
        lastInteraction: Timestamp.now(),
        totalInteractions: memory.totalInteractions + 1,
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const memoryRef = doc(db, this.memoryCollection, userId);
      await updateDoc(memoryRef, {
        preferences,
        lastInteraction: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  /**
   * Update business knowledge
   */
  async updateBusinessKnowledge(userId: string, knowledge: Partial<BusinessKnowledge>): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      const updatedKnowledge = {
        ...memory.businessKnowledge,
        ...knowledge,
      };

      const memoryRef = doc(db, this.memoryCollection, userId);
      await updateDoc(memoryRef, {
        businessKnowledge: updatedKnowledge,
        lastInteraction: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating business knowledge:', error);
    }
  }

  /**
   * Add successful tactic
   */
  async addSuccessfulTactic(userId: string, tactic: string): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      const successfulTactics = memory.businessKnowledge.successfulTactics || [];
      if (!successfulTactics.includes(tactic)) {
        successfulTactics.push(tactic);
      }

      await this.updateBusinessKnowledge(userId, { successfulTactics });
    } catch (error) {
      console.error('Error adding successful tactic:', error);
    }
  }

  /**
   * Add failed tactic
   */
  async addFailedTactic(userId: string, tactic: string): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      const failedTactics = memory.businessKnowledge.failedTactics || [];
      if (!failedTactics.includes(tactic)) {
        failedTactics.push(tactic);
      }

      await this.updateBusinessKnowledge(userId, { failedTactics });
    } catch (error) {
      console.error('Error adding failed tactic:', error);
    }
  }

  /**
   * Update learnings
   */
  async updateLearnings(userId: string, learnings: Partial<Learnings>): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      const updatedLearnings = {
        ...memory.learnings,
        ...learnings,
        lastUpdated: new Date(),
      };

      const memoryRef = doc(db, this.memoryCollection, userId);
      await updateDoc(memoryRef, {
        learnings: {
          ...updatedLearnings,
          lastUpdated: Timestamp.fromDate(updatedLearnings.lastUpdated!),
        },
        lastInteraction: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating learnings:', error);
    }
  }

  /**
   * Save quick fact for easy retrieval
   */
  async saveQuickFact(userId: string, key: string, value: any): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      memory.quickFacts[key] = value;

      const memoryRef = doc(db, this.memoryCollection, userId);
      await updateDoc(memoryRef, {
        quickFacts: memory.quickFacts,
        lastInteraction: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving quick fact:', error);
    }
  }

  /**
   * Get context for FlowBot (recent conversations + knowledge)
   */
  async getContextForFlowBot(userId: string): Promise<string> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return '';

      let context = '';

      // Add business knowledge
      if (memory.businessKnowledge.niche) {
        context += `User's business niche: ${memory.businessKnowledge.niche}\n`;
      }
      if (memory.businessKnowledge.targetAudience) {
        context += `Target audience: ${memory.businessKnowledge.targetAudience}\n`;
      }
      if (memory.businessKnowledge.brandVoice) {
        context += `Brand voice: ${memory.businessKnowledge.brandVoice}\n`;
      }

      // Add successful tactics
      if (memory.businessKnowledge.successfulTactics?.length) {
        context += `\nWhat works for this user:\n- ${memory.businessKnowledge.successfulTactics.join('\n- ')}\n`;
      }

      // Add failed tactics to avoid
      if (memory.businessKnowledge.failedTactics?.length) {
        context += `\nWhat doesn't work (avoid suggesting):\n- ${memory.businessKnowledge.failedTactics.join('\n- ')}\n`;
      }

      // Add learnings
      if (memory.learnings.topPerformingContentTypes?.length) {
        context += `\nTop performing content types: ${memory.learnings.topPerformingContentTypes.join(', ')}\n`;
      }

      // Add preferences
      if (memory.preferences.communicationStyle) {
        context += `\nPreferred communication style: ${memory.preferences.communicationStyle}\n`;
      }
      if (memory.preferences.automationLevel) {
        context += `Automation preference: ${memory.preferences.automationLevel}\n`;
      }

      // Add recent conversation summary (last 5 messages)
      if (memory.recentConversations.length > 0) {
        context += `\nRecent conversation context:\n`;
        const recent = memory.recentConversations.slice(-5);
        recent.forEach(msg => {
          context += `${msg.role}: ${msg.content.substring(0, 100)}...\n`;
        });
      }

      // Add goals
      if (memory.goals.length > 0) {
        context += `\nUser's goals:\n- ${memory.goals.join('\n- ')}\n`;
      }

      return context;
    } catch (error) {
      console.error('Error getting context for FlowBot:', error);
      return '';
    }
  }

  /**
   * Add goal
   */
  async addGoal(userId: string, goal: string): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      if (!memory.goals.includes(goal)) {
        memory.goals.push(goal);
      }

      const memoryRef = doc(db, this.memoryCollection, userId);
      await updateDoc(memoryRef, {
        goals: memory.goals,
        lastInteraction: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  }

  /**
   * Add achievement
   */
  async addAchievement(userId: string, achievement: string): Promise<void> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return;

      memory.achievements.push(achievement);

      const memoryRef = doc(db, this.memoryCollection, userId);
      await updateDoc(memoryRef, {
        achievements: memory.achievements,
        lastInteraction: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  }

  /**
   * Get memory summary for user
   */
  async getMemorySummary(userId: string): Promise<string> {
    try {
      const memory = await this.getMemory(userId);
      if (!memory) return 'No memory found.';

      let summary = `📊 FlowBot Memory Summary\n\n`;
      summary += `Total interactions: ${memory.totalInteractions}\n`;
      summary += `Last interaction: ${memory.lastInteraction.toLocaleDateString()}\n\n`;

      if (memory.businessKnowledge.niche) {
        summary += `🎯 Niche: ${memory.businessKnowledge.niche}\n`;
      }

      if (memory.goals.length > 0) {
        summary += `\n🎯 Goals:\n- ${memory.goals.join('\n- ')}\n`;
      }

      if (memory.achievements.length > 0) {
        summary += `\n🏆 Achievements:\n- ${memory.achievements.join('\n- ')}\n`;
      }

      if (memory.businessKnowledge.successfulTactics?.length) {
        summary += `\n✅ What's working:\n- ${memory.businessKnowledge.successfulTactics.join('\n- ')}\n`;
      }

      return summary;
    } catch (error) {
      console.error('Error getting memory summary:', error);
      return 'Error getting memory summary.';
    }
  }
}

// Singleton instance
export const flowbotMemory = new FlowBotMemoryService();
