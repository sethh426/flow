const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.post('/mcp', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const requestData = JSON.stringify({
            model: "claude-haiku-3",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        };

        const apiRequest = https.request(options, (apiRes) => {
            let data = '';
            
            apiRes.on('data', (chunk) => {
                data += chunk;
            });
            
            apiRes.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (apiRes.statusCode === 200) {
                        res.json({
                            response: response.completion,
                            model: "claude-haiku-3"
                        });
                    } else {
                        res.status(apiRes.statusCode).json({ error: response });
                    }
                } catch (error) {
                    res.status(500).json({ error: 'Failed to parse response' });
                }
            });
        });

        apiRequest.on('error', (error) => {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        });

        apiRequest.write(requestData);
        apiRequest.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'Claude Pro MCP server is running' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`MCP server running on port ${PORT}`);
});