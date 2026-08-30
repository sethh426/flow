#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase
const serviceAccount = JSON.parse(
  readFileSync('../serviceAccountKey-studio.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'flow-69826693-f6d27'
});

const db = admin.firestore();
db.settings({ databaseId: 'flow' });

// Create MCP server
const server = new Server(
  {
    name: 'affiliateflow-firebase',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Get Products
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_products',
        description: 'Get products from Firestore with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of products to return (default 20)',
            },
            status: {
              type: 'string',
              description: 'Filter by status: pending, approved, rejected',
            },
            category: {
              type: 'string',
              description: 'Filter by category',
            },
          },
        },
      },
      {
        name: 'get_stats',
        description: 'Get dashboard statistics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_categories',
        description: 'Get category breakdown with counts',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'approve_product',
        description: 'Approve a product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'The product ID to approve',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'reject_product',
        description: 'Reject a product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'The product ID to reject',
            },
          },
          required: ['productId'],
        },
      },
      {
        name: 'add_product',
        description: 'Add a new product to Firestore',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'string' },
            source: { type: 'string' },
            url: { type: 'string' },
          },
          required: ['name', 'category', 'price', 'source'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_products': {
        let query = db.collection('products').orderBy('timestamp', 'desc');

        if (args.status) {
          query = query.where('status', '==', args.status);
        }
        if (args.category) {
          query = query.where('category', '==', args.category);
        }

        const limit = args.limit || 20;
        query = query.limit(limit);

        const snapshot = await query.get();
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      }

      case 'get_stats': {
        const doc = await db.collection('stats').doc('current').get();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(doc.data(), null, 2),
            },
          ],
        };
      }

      case 'get_categories': {
        const statsDoc = await db.collection('stats').doc('current').get();
        const stats = statsDoc.data();

        const categoryData = Object.entries(stats.categoryBreakdown || {}).map(
          ([name, count]) => ({
            name,
            count,
            source: name.toLowerCase().includes('trending') ? 'trending' : 'new',
          })
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(categoryData, null, 2),
            },
          ],
        };
      }

      case 'approve_product': {
        await db
          .collection('products')
          .doc(args.productId)
          .update({ status: 'approved', approved: true });

        return {
          content: [
            {
              type: 'text',
              text: `Product ${args.productId} approved successfully`,
            },
          ],
        };
      }

      case 'reject_product': {
        await db
          .collection('products')
          .doc(args.productId)
          .update({ status: 'rejected', approved: false });

        return {
          content: [
            {
              type: 'text',
              text: `Product ${args.productId} rejected successfully`,
            },
          ],
        };
      }

      case 'add_product': {
        const newProduct = {
          name: args.name,
          category: args.category,
          price: args.price,
          source: args.source,
          url: args.url || '',
          status: 'pending',
          approved: false,
          timestamp: new Date().toISOString(),
        };

        const docRef = await db.collection('products').add(newProduct);

        return {
          content: [
            {
              type: 'text',
              text: `Product added with ID: ${docRef.id}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AffiliateFlow MCP Server running on stdio');
}

main().catch(console.error);
