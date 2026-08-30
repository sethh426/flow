/**
 * Firebase Functions Entry Point
 * Re-exports all functions from the compiled dist folder
 */

const functions = require('./dist/functions');

// Export unified API handler (handles all /api/* routes from Next.js)
exports.api = functions.api;

// Export all HTTP functions
exports.aiRoute = functions.aiRoute;
exports.aiAnalyze = functions.aiAnalyze;
exports.aiGenerate = functions.aiGenerate;
exports.aiCode = functions.aiCode;
exports.aiBatch = functions.aiBatch;
exports.aiHealth = functions.aiHealth;

// Export all background functions
exports.aiEventProcessor = functions.aiEventProcessor;
exports.cleanupScheduled = functions.cleanupScheduled;
exports.aggregateMetrics = functions.aggregateMetrics;
