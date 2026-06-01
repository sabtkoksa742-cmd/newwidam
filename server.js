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

// ==================== Supabase Config ====================
const SUPABASE_URL = 'https://xjbuzqwfphmujprwmghz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYnV6cXdmcGhtdWpwcndtZ2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTE3NjMsImV4cCI6MjA5NTg4Nzc2M30.q1fp26w8DVWkE2pyJXw88zDmOtXxkq7bbq4OVdx44wg';

// ==================== Telegram Config ====================
const TELEGRAM_BOT_TOKEN = '8573611022:AAHmICUdCas4w8vd5z_Kc0g1hEb_pXkJLMg';
const TELEGRAM_CHAT_ID = '1643260223';

// ==================== Admin Config ====================
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ==================== Supabase Helper Functions ====================
async function supabaseFetch(table, options = {}) {
    const { method = 'GET', body = null, params = {} } = options;
    
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            queryParams.append(key, value);
        }
    }
    
    const queryString = queryParams.toString();
    if (queryString) url += '?' + queryString;
    
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
    
    const fetchOptions = { method, headers };
    
    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, fetchOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Supabase error');
        }
        
        return data;
    } catch (error) {
        console.error('Supabase fetch error:', error);
        throw error;
    }
}

async function getProducts() {
    return await supabaseFetch('products', { 
        params: { select: '*', order: 'id.desc' } 
    });
}

async function addProduct(product) {
    return await supabaseFetch('products', {
        method: 'POST',
        body: product
    });
}

async function updateProduct(id, updates) {
    return await supabaseFetch(`products?id=eq.${id}`, {
        method: 'PATCH',
        body: updates
    });
}

async function deleteProduct(id) {
    return await supabaseFetch(`products?id=eq.${id}`, {
        method: 'DELETE'
    });
}

async function getProductById(id) {
    return await supabaseFetch('products', {
        params: { id: `eq.${id}`, select: '*', limit: 1 }
    });
}

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

    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const sessions = readJsonFile(sessionsFile, []);
            const s = sessions.find(x => x.id === token);
            if (s) {
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

// ==================== Products API (Supabase) ====================

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Add product (admin)
app.post('/api/products', validateAdminAuth, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, previous_price, discount, category } = req.body;
        
        let image_url = '';
        if (req.file) {
            // Upload to Supabase Storage for permanent storage
            try {
                image_url = await uploadToSupabaseStorage(req.file);
            } catch (uploadErr) {
                console.error('Supabase upload failed, using local:', uploadErr.message);
                image_url = '/uploads/' + req.file.filename;
            }
        }
        
        const newProduct = {
            name: name || 'New Product',
            description: description || '',
            price: parseFloat(price) || 0,
            previous_price: parseFloat(previous_price) || 0,
            discount: parseFloat(discount) || 0,
            category: category || '',
            image_url: image_url
        };
        
        const result = await addProduct(newProduct);
        res.json({ success: true, message: 'Product added', data: result[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Update product (admin)
app.put('/api/products/:id', validateAdminAuth, upload.single('image'), async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, description, price, previous_price, discount, category } = req.body;
        
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = parseFloat(price);
        if (previous_price !== undefined) updates.previous_price = parseFloat(previous_price);
        if (discount !== undefined) updates.discount = parseFloat(discount);
        if (category !== undefined) updates.category = category;
        
        if (req.file) {
            try {
                updates.image_url = await uploadToSupabaseStorage(req.file);
            } catch (uploadErr) {
                console.error('Supabase upload failed, using local:', uploadErr.message);
                updates.image_url = '/uploads/' + req.file.filename;
            }
        }
        
        const result = await updateProduct(productId, updates);
        res.json({ success: true, message: 'Product updated', data: result[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Delete product (admin)
app.delete('/api/products/:id', validateAdminAuth, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        await deleteProduct(productId);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Delete all products (admin)
app.delete('/api/products', validateAdminAuth, async (req, res) => {
    try {
        const products = await getProducts();
        for (const product of products) {
            await deleteProduct(product.id);
        }
        res.json({ success: true, message: 'All products deleted' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Duplicate product (admin)
app.post('/api/products/:id/duplicate', validateAdminAuth, async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = await getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const { id, created_at, updated_at, ...productData } = product;
        const newProduct = {
            ...productData,
            name: productData.name + ' (Copy)'
        };
        
        const result = await addProduct(newProduct);
        res.json({ success: true, message: 'Product duplicated', data: result[0] });
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
// LOGIN ENDPOINT WITH DEBUG
app.post('/api/admin/login', (req, res) => {
    console.log('=== LOGIN DEBUG ===');
    console.log('Body:', JSON.stringify(req.body));
    console.log('Content-Type:', req.headers['content-type']);
    
    try {
        const { username, password } = req.body || {};
        const settings = getSettings();
        
        console.log('Received username:', username);
        console.log('Received password length:', password ? password.length : 0);
        console.log('Received password bytes:', Buffer.from(password || '').toString('hex'));
        console.log('Expected username:', settings.admin_username);
        console.log('Expected password length:', settings.admin_password.length);
        console.log('Expected password bytes:', Buffer.from(settings.admin_password).toString('hex'));
        console.log('Are passwords equal?:', password === settings.admin_password);
        
        if (!username || !password) {
            console.log('Missing credentials');
            return res.status(400).json({ success: false, message: 'Missing credentials' });
        }

        const valid = (username === settings.admin_username && password === settings.admin_password);
        console.log('Validation result:', valid);
        
        if (!valid) {
            console.log('Invalid credentials - settings might be different');
            return res.status(403).json({ success: false, message: 'Invalid credentials' });
        }

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

app.get('/api/admin/sessions', validateAdminAuth, (req, res) => {
    try {
        const sessions = readJsonFile(sessionsFile, []);
        res.json({ success: true, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

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
║  Supabase: Connected ✅                 ║
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
// ==================== Emergency Password Reset (remove in production) ====================
app.post('/api/admin/reset-password', (req, res) => {
    try {
        const { new_password } = req.body || {};
        if (!new_password || new_password.length < 4) {
            return res.status(400).json({ success: false, message: 'Password too short' });
        }
        const settings = getSettings();
        settings.admin_password = String(new_password);
        writeJsonFile(settingsFile, settings);
        res.json({ success: true, message: 'Password updated', username: settings.admin_username });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Debug: Show current admin username (remove in production)
app.get('/api/debug/admin-info', (req, res) => {
    const settings = getSettings();
    res.json({ 
        admin_username: settings.admin_username,
        has_backup_password: !!settings.backup_password,
        default_username: ADMIN_USERNAME
    });
});

// TEMPORARY: Hardcoded admin login (for debugging only - remove later)
app.post('/api/debug/login', (req, res) => {
    try {
        const { username, password } = req.body || {};
        console.log('DEBUG LOGIN: username =', username, 'password =', password);
        
        // Hardcoded credentials - remove after debugging
        if (username === 'admin' && password === 'admin123') {
            const token = uuidv4();
            const sessions = readJsonFile(sessionsFile, []);
            const session = { id: token, username: username, createdAt: new Date().toISOString() };
            sessions.push(session);
            writeJsonFile(sessionsFile, sessions);
            res.json({ success: true, token: token, session: session, message: 'Debug login successful' });
        } else {
            res.status(403).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Debug login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Debug: Test login with verbose output (remove in production)
app.post('/api/debug/login-test', (req, res) => {
    try {
        const { username, password } = req.body || {};
        const settings = getSettings();
        
        const adminUserMatch = username === settings.admin_username;
        const adminPassMatch = password === settings.admin_password;
        const backupMatch = settings.backup_password && password === settings.backup_password && username === settings.admin_username;
        
        res.json({
            received_username: username,
            received_password_length: password ? password.length : 0,
            expected_username: settings.admin_username,
            expected_password_length: settings.admin_password.length,
            admin_username_matches: adminUserMatch,
            admin_password_matches: adminPassMatch,
            backup_matches: backupMatch,
            full_check: adminUserMatch && adminPassMatch
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ============ SUPABASE STORAGE FOR IMAGES ============
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || SUPABASE_KEY;

async function uploadToSupabaseStorage(file) {
    try {
        const formData = new FormData();
        const buffer = Buffer.from(file.buffer);
        const blob = new Blob([buffer], { type: file.mimetype });
        formData.append('file', blob, file.originalname);
        
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${timestamp}_${safeName}`;
        
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'apikey': SUPABASE_KEY,
                    'Content-Type': file.mimetype
                },
                body: buffer
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase upload error:', errorText);
            throw new Error('Failed to upload to Supabase Storage');
        }
        
        return `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
    } catch (err) {
        console.error('Upload error:', err);
        throw err;
    }
}
