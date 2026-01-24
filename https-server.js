const https = require('https');
const fs = require('fs');
const path = require('path');

// Create self-signed certificate
const { execSync } = require('child_process');

// Check if certificates already exist
if (!fs.existsSync('key.pem') || !fs.existsSync('cert.pem')) {
    // Generate self-signed certificate
    try {
        console.log('🔐 Generating SSL certificate...');
        execSync('openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1"', { stdio: 'inherit' });
        console.log('✅ SSL certificate generated');
    } catch (error) {
        console.error('❌ Failed to generate SSL certificate. Please run: bash generate-certs.sh');
        console.error('   Or install OpenSSL and try again.');
        process.exit(1);
    }
} else {
    console.log('✅ Using existing SSL certificates');
}

// HTTPS server options
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-CHACHA20-POLY1305',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'DHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES256-GCM-SHA384',
        '!aNULL',
        '!eNULL',
        '!EXPORT',
        '!DES',
        '!RC4',
        '!MD5',
        '!PSK',
        '!SRP',
        '!CAMELLIA',
        '!3DES'
    ].join(':'),
    honorCipherOrder: true
};

// Create HTTPS server
const server = https.createServer(options, (req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // CORS headers for Safari compatibility
    const headers = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range',
        'Accept-Ranges': 'bytes'
    };

    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
        return;
    }

    // Check if file exists
    fs.stat(filePath, (err, stats) => {

        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
            return;
        }

        // Handle Range requests for video files (Safari requirement)
        if (extname === '.mp4' && req.headers.range) {
            const range = req.headers.range;
            const positions = range.replace(/bytes=/, "").split("-");
            const start = parseInt(positions[0], 10);
            const total = stats.size;
            const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            const chunksize = (end - start) + 1;

            headers['Content-Range'] = `bytes ${start}-${end}/${total}`;
            headers['Content-Length'] = chunksize;

            res.writeHead(206, headers); // 206 Partial Content

            const stream = fs.createReadStream(filePath, { start: start, end: end });
            stream.pipe(res);
        } else {
            // Regular file request
            headers['Content-Length'] = stats.size;
            res.writeHead(200, headers);

            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        }
    });
});

// Start HTTPS server
server.listen(3000, () => {
    console.log('🚀 HTTPS Server running on https://localhost:3000');
    console.log('📱 Mobile URL: https://192.168.199.57:3000');
    console.log('⚠️  You may need to accept the security warning for self-signed certificate');
    console.log('🔐 This will enable camera access for WebAR!');
});
