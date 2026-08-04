const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Bypass Modules ---

// 1. Generic redirect bypass (e.g., simple meta refresh or HTTP redirects)
async function bypassGeneric(url) {
    try {
        // Follow redirects automatically
        const response = await axios.get(url, { maxRedirects: 5 });
        const $ = cheerio.load(response.data);
        
        // Check for a meta refresh tag
        const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
        if (metaRefresh && metaRefresh.toLowerCase().includes('url=')) {
            return metaRefresh.split(/url=/i)[1].replace(/['"]/g, '');
        }

        // Check if the final URL was reached via standard HTTP redirects
        if (response.request.res.responseUrl && response.request.res.responseUrl !== url) {
             return response.request.res.responseUrl;
        }

        return url; // Return original if no redirect is found
    } catch (error) {
        throw new Error('Failed to process generic link');
    }
}

// 2. Add custom logic for specific domains here
async function bypassSpecificService(url) {
    // Example: Fetch the page, find a specific script tag, extract a hidden token, 
    // and make a POST request to their internal API to get the real URL.
    return "https://example.com/real-destination";
}

// --- API Endpoint ---

app.get('/api/bypass', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const urlObj = new URL(targetUrl);
        let finalUrl = '';

        // Route to specific bypassers based on hostname
        if (urlObj.hostname.includes('specific-ad-service.com')) {
            finalUrl = await bypassSpecificService(targetUrl);
        } else {
            // Fallback to generic parsing
            finalUrl = await bypassGeneric(targetUrl);
        }

        res.json({ 
            success: true,
            original: targetUrl, 
            bypassed: finalUrl 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Bypasser API running on port ${PORT}`);
});

