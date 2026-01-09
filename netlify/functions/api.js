/**
 * SERVERLESS API GATEWAY
 * Entry point for all SaaS Automation.
 */

const engine = require('../../factory/engine'); // Import the Orchestrator

exports.handler = async (event, context) => {
    const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');
    const method = event.httpMethod;

    // CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (method === 'OPTIONS') return { statusCode: 204, headers, body: '' };

    try {
        // --- ADMIN: ACTIVATE CLIENT ---
        if (path === '/admin/activate' && method === 'POST') {
            // 1. Security Check
            const token = event.headers.authorization || event.headers.Authorization;
            const secret = process.env.ADMIN_API_KEY;

            if (!secret || token !== secret) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized: Invalid API Key" }) };
            }

            // 2. Parse Body
            const body = JSON.parse(event.body);
            if (!body.name || !body.plan) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing name or plan" }) };
            }

            // 3. Call Factory Engine
            const result = await engine.activateClient({
                name: body.name,
                plan: body.plan,
                whatsapp: body.whatsapp,
                id: body.id, // Optional custom subdomain
                amount: body.amount,
                payment_method: body.payment_method,
                activated_by: 'API_GATEWAY'
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        }

        // --- PUBLIC: ME (Dashboard Data) ---
        if (path === '/me' && method === 'GET') {
            // Mock auth for demo
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    name: "Demo Client",
                    plan: "plan2",
                    stats: { leads: 123 }
                })
            };
        }

        // 404
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Not Found" }) };

    } catch (e) {
        console.error("API Error:", e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: e.message })
        };
    }
};
