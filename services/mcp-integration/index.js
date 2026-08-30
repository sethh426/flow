/**
 * AffiliateFlow MCP Server Integration
 * Connects external data sources (Nordstrom, filesystem) to the AI orchestrator
 */

import { spawn } from 'child_process';
import { Firestore } from '@google-cloud/firestore';
import fs from 'fs/promises';
import path from 'path';

class MCPIntegration {
  constructor() {
    this.firestore = new Firestore();
    this.servers = new Map();
    this.productCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize MCP servers based on configuration
   */
  async initializeMCPServers() {
    try {
      console.log('[MCP Integration] Initializing MCP servers...');

      // Initialize filesystem server for Nordstrom data
      await this.initializeFilesystemServer();

      // Initialize Firebase MCP server
      await this.initializeFirebaseServer();

      console.log('[MCP Integration] All servers initialized successfully');

    } catch (error) {
      console.error('[MCP Integration] Failed to initialize servers:', error);
      throw error;
    }
  }

  /**
   * Initialize filesystem MCP server for Nordstrom data access
   */
  async initializeFilesystemServer() {
    const config = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', 'C:\\Users\\sethp\\Downloads\\mcp-nordstrom']
    };

    const server = await this.spawnMCPServer('filesystem', config);
    this.servers.set('filesystem', server);

    console.log('[MCP Integration] Filesystem server initialized');
  }

  /**
   * Initialize Firebase MCP server for Nordstrom scraper project
   */
  async initializeFirebaseServer() {
    const serviceAccountPath = 'C:\\Users\\sethp\\Downloads\\mcp-nordstrom\\serviceAccountKey.json';

    // Check if service account file exists
    try {
      await fs.access(serviceAccountPath);
    } catch (error) {
      console.warn('[MCP Integration] Service account file not found, skipping Firebase MCP server');
      return;
    }

    const config = {
      command: 'npx',
      args: [
        '-y',
        '@firebase/mcp-server',
        '--project', 'nordstrom-scraper',
        '--serviceAccountKey', serviceAccountPath
      ]
    };

    const server = await this.spawnMCPServer('firebase', config);
    this.servers.set('firebase', server);

    console.log('[MCP Integration] Firebase MCP server initialized');
  }

  /**
   * Spawn and manage MCP server process
   */
  async spawnMCPServer(name, config) {
    return new Promise((resolve, reject) => {
      console.log(`[MCP Integration] Spawning ${name} server...`);

      const serverProcess = spawn(config.command, config.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      serverProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`[MCP ${name}] ${data.toString().trim()}`);
      });

      serverProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`[MCP ${name} Error] ${data.toString().trim()}`);
      });

      serverProcess.on('error', (error) => {
        console.error(`[MCP ${name}] Failed to start:`, error);
        reject(error);
      });

      // Wait for server to be ready
      setTimeout(() => {
        if (serverProcess.connected) {
          resolve({
            process: serverProcess,
            name,
            stdout,
            stderr,
            lastHealthCheck: Date.now()
          });
        } else {
          reject(new Error(`Server ${name} failed to start properly`));
        }
      }, 5000);
    });
  }

  /**
   * Search for products using MCP servers
   */
  async searchProducts(query, filters = {}) {
    try {
      console.log(`[MCP Integration] Searching products: ${query}`);

      // Check cache first
      const cacheKey = `${query}_${JSON.stringify(filters)}`;
      const cached = this.productCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        console.log('[MCP Integration] Returning cached results');
        return cached.data;
      }

      let products = [];

      // Search via filesystem server (Nordstrom data)
      if (this.servers.has('filesystem')) {
        const filesystemProducts = await this.searchFilesystemProducts(query, filters);
        products.push(...filesystemProducts);
      }

      // Search via Firebase server if available
      if (this.servers.has('firebase')) {
        const firebaseProducts = await this.searchFirebaseProducts(query, filters);
        products.push(...firebaseProducts);
      }

      // Remove duplicates and normalize data
      products = this.deduplicateProducts(products);

      // Cache results
      this.productCache.set(cacheKey, {
        data: products,
        timestamp: Date.now()
      });

      // Save to Firestore for AI orchestrator access
      await this.saveProductsToFirestore(products);

      return products;

    } catch (error) {
      console.error('[MCP Integration] Product search failed:', error);
      throw error;
    }
  }

  /**
   * Search products via filesystem MCP server
   */
  async searchFilesystemProducts(query, filters) {
    try {
      // This would communicate with the MCP server
      // For now, simulate reading from local Nordstrom data
      const nordstromPath = 'C:\\Users\\sethp\\Downloads\\mcp-nordstrom';
      const products = await this.readNordstromData(nordstromPath, query, filters);

      return products.map(product => ({
        ...product,
        source: 'nordstrom',
        affiliateUrl: this.generateAffiliateUrl(product),
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      console.error('[MCP Integration] Filesystem search failed:', error);
      return [];
    }
  }

  /**
   * Search products via Firebase MCP server
   */
  async searchFirebaseProducts(query, filters) {
    try {
      // This would query the Firebase MCP server
      // For now, return empty array as Firebase MCP server may not be available
      return [];

    } catch (error) {
      console.error('[MCP Integration] Firebase search failed:', error);
      return [];
    }
  }

  /**
   * Read Nordstrom product data from local filesystem
   */
  async readNordstromData(basePath, query, filters) {
    try {
      // Look for product data files
      const files = await fs.readdir(basePath);
      const productFiles = files.filter(file => file.includes('product') || file.endsWith('.json'));

      let allProducts = [];

      for (const file of productFiles) {
        try {
          const filePath = path.join(basePath, file);
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);

          // Extract products from the file
          const products = this.extractProductsFromData(data, query, filters);
          allProducts.push(...products);

        } catch (error) {
          console.warn(`[MCP Integration] Could not read file ${file}:`, error.message);
        }
      }

      return allProducts;

    } catch (error) {
      console.error('[MCP Integration] Failed to read Nordstrom data:', error);
      return [];
    }
  }

  /**
   * Extract products from various data formats
   */
  extractProductsFromData(data, query, filters) {
    const products = [];

    // Handle different data structures
    if (Array.isArray(data)) {
      products.push(...data);
    } else if (data.products) {
      products.push(...data.products);
    } else if (data.items) {
      products.push(...data.items);
    } else if (data.results) {
      products.push(...data.results);
    }

    // Filter by query
    let filteredProducts = products.filter(product => {
      if (!query) return true;

      const searchText = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Apply additional filters
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    if (filters.priceMin) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.priceMin);
    }

    if (filters.priceMax) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.priceMax);
    }

    return filteredProducts.slice(0, 50); // Limit results
  }

  /**
   * Generate affiliate URL for Nordstrom products
   */
  generateAffiliateUrl(product) {
    // This would integrate with actual affiliate program
    // For now, return a placeholder
    return `https://affiliate.example.com/product/${product.id}`;
  }

  /**
   * Remove duplicate products based on ID or name
   */
  deduplicateProducts(products) {
    const seen = new Set();
    return products.filter(product => {
      const key = product.id || product.name;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Save products to Firestore for AI orchestrator access
   */
  async saveProductsToFirestore(products) {
    try {
      const batch = this.firestore.batch();

      for (const product of products) {
        const productRef = this.firestore.collection('products').doc(product.id || uuidv4());
        batch.set(productRef, {
          ...product,
          lastSynced: new Date(),
          source: 'mcp_integration'
        });
      }

      await batch.commit();
      console.log(`[MCP Integration] Saved ${products.length} products to Firestore`);

    } catch (error) {
      console.error('[MCP Integration] Failed to save products to Firestore:', error);
    }
  }

  /**
   * Health check for MCP servers
   */
  async healthCheck() {
    const results = {};

    for (const [name, server] of this.servers) {
      try {
        // Check if process is still running
        if (server.process && !server.process.killed) {
          results[name] = 'healthy';
          server.lastHealthCheck = Date.now();
        } else {
          results[name] = 'dead';
        }
      } catch (error) {
        results[name] = 'error';
        console.error(`[MCP Integration] Health check failed for ${name}:`, error);
      }
    }

    return results;
  }

  /**
   * Clean up MCP server connections
   */
  async cleanup() {
    console.log('[MCP Integration] Cleaning up server connections...');

    for (const [name, server] of this.servers) {
      try {
        if (server.process && !server.process.killed) {
          server.process.kill();
          console.log(`[MCP Integration] Killed ${name} server`);
        }
      } catch (error) {
        console.error(`[MCP Integration] Error killing ${name} server:`, error);
      }
    }

    this.servers.clear();
    this.productCache.clear();
  }
}

