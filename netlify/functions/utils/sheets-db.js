/**
 * SERVERLESS UTILS: Google Sheets DB
 * Connects to the Master Sheet acting as the Database.
 */

// const { google } = require('googleapis');
// const sheets = google.sheets('v4');

const MOCK_DB_SHEET_ID = process.env.MASTER_SHEET_ID || "mock_sheet_db";

async function logToSheet(data) {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
        console.log(`📝 [MOCK SHEET DB] Appending row to ${MOCK_DB_SHEET_ID}:`);
        console.log(`   - Client: ${data.name} (${data.id})`);
        console.log(`   - Plan: ${data.plan}`);
        console.log(`   - WhatsApp: ${data.whatsapp}`);
        console.log(`   - Paid: ${data.amount} via ${data.payment_method}`);
        console.log(`   - Activated By: ${data.activated_by || 'system'}`);
        return true;
    }

    // Real Implementation
    try {
        const { google } = require('googleapis');

        // Parse Service Account
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const values = [
            [
                data.id,
                data.name,
                data.plan,
                data.whatsapp,
                data.payment_method,
                data.amount,
                data.activated_by || 'system',
                new Date().toISOString(),
                data.url || 'pending',
                data.sheetId || 'pending'
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.MASTER_SHEET_ID,
            range: 'Clients!A:J', // Assumes a sheet named "Clients"
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });

        console.log(`✅ Logged to Sheet ${process.env.MASTER_SHEET_ID}`);
        return true;

    } catch (error) {
        console.error("❌ Sheets Error:", error);
        // Don't fail the whole process if sheet logging fails, just log it.
        return false;
    }
}

async function getClient(clientId) {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
        console.log(`📝 [MOCK SHEET DB] Fetching client ${clientId}`);
        // Return mock found data
        return {
            id: clientId,
            name: "Serverless Client",
            plan: "plan2",
            stats: { leads: 50, revenue: 100 }
        };
    }
}

module.exports = { logToSheet, getClient };
