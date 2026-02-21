const http = require('http');
const https = require('https');

// SETTINGS
const PORT = process.env.PORT || 10000;
const BETPAWA_HOST = 'www.betpawa.co.zm';

// SAFETY: Pretend to be different types of phones/computers
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36'
];

async function fetchSafe(path) {
    // SAFETY: Wait 2 to 5 seconds so it looks like a human click
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(r => setTimeout(r, delay));

    return new Promise((resolve, reject) => {
        const options = {
            hostname: BETPAWA_HOST,
            path: path,
            headers: {
                'X-Pawa-Brand': 'betpawa-zambia',
                'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                'Accept': 'application/json'
            }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // PAGE VIEW
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Virtual Predictor</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { background: #0b0e11; color: #ffffff; font-family: sans-serif; text-align: center; padding: 20px; }
                    .btn { background: #00ff44; color: black; padding: 20px 40px; border: none; border-radius: 50px; font-size: 20px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(0,255,0,0.3); }
                    #loader { margin-top: 20px; color: #888; display: none; }
                    #box { background: #1c2128; padding: 20px; border-radius: 15px; margin-top: 30px; display: none; border: 1px solid #30363d; }
                </style>
            </head>
            <body>
                <h2>📊 VIRTUAL PREDICTOR</h2>
                <button class="btn" onclick="getTips()">GET PREDICTIONS</button>
                <div id="loader">Checking matches... Please wait.</div>
                <div id="box"></div>

                <script>
                    function playSound() {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.play();
                    }

                    async function getTips() {
                        document.getElementById('loader').style.display = 'block';
                        document.getElementById('box').style.display = 'none';
                        
                        try {
                            const res = await fetch('/api/get-data');
                            const data = await res.json();
                            playSound(); // SOUND NOTIFICATION
                            
                            document.getElementById('loader').style.display = 'none';
                            document.getElementById('box').style.display = 'block';
                            document.getElementById('box').innerHTML = "<b>Next Round:</b> " + (data.items ? data.items[0].name : "No Data");
                            console.log(data);
                        } catch (e) {
                            alert("Safety check failed. Try again in 30 seconds.");
                        }
                    }
                </script>
            </body>
            </html>
        `);
    } 
    // DATA FETCH
    else if (req.url === '/api/get-data') {
        try {
            const data = await fetchSafe('/api/sportsbook/virtual/v1/seasons/list/actual');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (e) {
            res.writeHead(500); res.end("Error");
        }
    }
});

server.listen(PORT, '0.0.0.0', () => console.log('Server is running!'));