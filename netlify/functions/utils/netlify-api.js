/**
 * SERVERLESS UTILS: Netlify Provisioner
 * Handles site replication via API.
 */

// const fetch = require('node-fetch'); // Enable if using Node < 18

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

async function provisionClientSite(clientData) {
    console.log(`☁️ SERVERLESS: Provisioning Site for ${clientData.name} (${clientData.plan})...`);

    if (!NETLIFY_TOKEN) {
        console.log("   ⚠️ No Token. Mocking provision.");
        return {
            siteId: `site_${Date.now()}`,
            url: `https://${clientData.id}-bx-serverless.netlify.app`,
            adminUrl: `https://app.netlify.com/sites/${clientData.id}`
        };
    }

    // Real Logic: Create Site from Template
    try {
        // Dynamic Template Mapping
        const TEMPLATE_MAP = {
            plan1: "Brandsxperts2025/brandsxperts-template-plan1",
            plan2: "Brandsxperts2025/brandsxperts-template-plan2",
            plan3: "Brandsxperts2025/brandsxperts-template-plan3",
        };

        const REPO_PATH = TEMPLATE_MAP[clientData.plan];

        if (!REPO_PATH) {
            throw new Error(`Invalid Plan: ${clientData.plan}. valid plans are: plan1, plan2, plan3.`);
        }

        console.log(`   🚀 Creating site from repo: ${REPO_PATH}`);

        // 1. Create Site
        const response = await fetch('https://api.netlify.com/api/v1/sites', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NETLIFY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `${clientData.id}-bx`, // e.g. cl_123456-bx.netlify.app
                repo: {
                    provider: "github",
                    repo: REPO_PATH,
                    private: false,
                    branch: "main"
                },
                env: {
                    BX_CLIENT_ID: clientData.id,
                    BX_PLAN: clientData.plan
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Netlify API Error: ${response.status} ${errText}`);
        }

        const site = await response.json();
        const siteUrl = site.ssl_url || site.url;
        const adminUrl = site.admin_url;

        console.log(`   ✅ Site Created: ${siteUrl}`);

        return {
            siteId: site.site_id,
            url: siteUrl,
            adminUrl: adminUrl
        };

    } catch (error) {
        console.error("   ❌ Provision Error:", error);
        // Fail gracefully or rethrow depending on strategy
        // For robustness, we rethrow so the Admin Panel sees the error
        throw error;
    }
}

module.exports = { provisionClientSite };
