const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// --- Domain Categories ---
const pastes = ['pastebin.com', 'paste-drop.com', 'pastefy.app', 'paster.so'];
const keySystems = ['platorelay.com', 'platoboost.app', 'platoboost.se', 'pandadevelopment.net', 'trigonevo.com', 'violated.lol', 'blox-script.com', 'boblox-script.com', 'hydrogen.lat', 'codex.lol'];
const adLinks = ['linkvertise.com', 'link-to.net', 'link-hub.net', 'link-target.net', 'loot-link.com', 'lootdest.org', 'free-content.pro', 'lootlabs.com', 'work.ink', 'workink.net', 'rinku.pro', '7rnb.io', 'stfly.vip', 'shrtslug.biz', 'lockr.sb', 'lockr.net', 'linkunlocker.com', 'link-unlock.com', 'arolinks.com', 'tpl.li', 'socialwolvez.com', 'linkify.ru', 'mboost.me', 'social-unlock.com', 'rekonise.com', 'rekonise.org', 'rkns.link', 'sub2unlock.com', 'sub2unlock.me', 'sub2unlock.io', 'sub4unlock.com', 'sub4unlock.me', 'sub4unlock.io', 'bstlar.com', 'scriptpastebins.com', 'sfl.gl', 'yorurl.com', 'robloxscripts.gg', 'lnbz.la', 'linkzy.space', 'ez4short.com'];

// --- Bypass Logic ---

async function bypassPaste(url) {
    // Example: Convert standard Pastebin to raw format to get the content
    if (url.includes('pastebin.com') && !url.includes('/raw/')) {
        return url.replace('pastebin.com/', 'pastebin.com/raw/');
    }
    return url; // Add other paste scrapers here
}

async function bypassAdvanced(url, category) {
    /* 
       NOTE: To bypass Linkvertise/Work.ink/Platoboost from scratch, you need 
       Puppeteer to solve JS challenges, or you need to route these to a 
       public Bypass API aggregator (like Bypass VIP or similar services).
       For now, we return a placeholder until you plug in your Puppeteer script.
    */
    return `[Requires Puppeteer/3rd Party API to crack ${category}] - ${url}`;
}

async function bypassGeneric(url) {
    try {
        const response = await axios.get(url, { maxRedirects: 5 });
        const $ = cheerio.load(response.data);
        const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
        if (metaRefresh && metaRefresh.toLowerCase().includes('url=')) {
            return metaRefresh.split(/url=/i)[1].replace(/['"]/g, '');
        }
        return response.request.res.responseUrl || url;
    } catch (error) {
        return url;
    }
}

// --- API Endpoint ---
app.get('/api/bypass', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: 'URL is required' });

    try {
        const urlObj = new URL(targetUrl);
        const host = urlObj.hostname.replace('www.', '');
        let finalUrl = '';

        // Route based on domain arrays
        if (pastes.includes(host)) {
            finalUrl = await bypassPaste(targetUrl);
        } else if (keySystems.includes(host)) {
            finalUrl = await bypassAdvanced(targetUrl, 'Key System');
        } else if (adLinks.includes(host)) {
            finalUrl = await bypassAdvanced(targetUrl, 'Ad Link');
        } else {
            finalUrl = await bypassGeneric(targetUrl);
        }

        res.json({ success: true, original: targetUrl, bypassed: finalUrl, domain: host });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Invalid URL format' });
    }
});

app.listen(PORT, () => console.log(`Bypasser API running on port ${PORT}`));
