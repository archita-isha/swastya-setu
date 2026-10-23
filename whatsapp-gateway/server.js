import express from 'express';
import cors from 'cors';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const AUTH_DIR = path.join(__dirname, 'auth_info');
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock = null;
let currentQr = null;
let connectionStatus = 'initializing';
let connectedUser = null;

const logger = pino({ level: 'silent' });

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[WA-GATEWAY] Using Baileys version: ${version.join('.')} (latest: ${isLatest})`);

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    generateHighQualityLinkPreview: false,
    browser: ['Swasthya Setu', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQr = qr;
      connectionStatus = 'scan_qr';
      try {
        await QRCode.toFile(path.join(__dirname, 'qr.png'), qr, { width: 350, margin: 2 });
      } catch (e) {}
      console.log('\n======================================================');
      console.log('   SCAN THE QR CODE BELOW IN YOUR WHATSAPP APP:');
      console.log('   (WhatsApp -> Linked Devices -> Link a Device)');
      console.log('   Or view in browser: http://localhost:' + PORT + '/qr');
      console.log('======================================================\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      connectionStatus = 'disconnected';
      connectedUser = null;

      console.log(`[WA-GATEWAY] Connection closed due to: ${lastDisconnect?.error?.message || statusCode}`);

      if (shouldReconnect) {
        console.log('[WA-GATEWAY] Reconnecting in 3 seconds...');
        setTimeout(() => connectToWhatsApp(), 3000);
      } else {
        console.log('[WA-GATEWAY] Logged out. Clearing session for fresh QR...');
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        } catch (e) {}
        setTimeout(() => connectToWhatsApp(), 2000);
      }
    } else if (connection === 'open') {
      connectionStatus = 'connected';
      currentQr = null;
      connectedUser = sock.user;
      console.log('\n======================================================');
      console.log(`[WA-GATEWAY] WhatsApp connected successfully!`);
      console.log(`[WA-GATEWAY] Logged in as: ${sock.user?.id || 'Connected'}`);
      console.log('======================================================\n');
    }
  });

  // Optional: listen for incoming replies (e.g. YES / NO blood donor responses)
  sock.ev.on('messages.upsert', async (m) => {
    try {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            const from = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            console.log(`[WA-INCOMING] From: ${from} | Text: ${text}`);
          }
        }
      }
    } catch (e) {
      console.error('[WA-GATEWAY] Error handling incoming message:', e);
    }
  });
}

// Format phone number to WhatsApp JID
function formatJid(phone) {
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return `${cleaned}@s.whatsapp.net`;
}

// HTTP API: Status
app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    connected: connectionStatus === 'connected',
    user: connectedUser,
  });
});

// HTTP API: QR Web Page
app.get('/qr', async (req, res) => {
  if (connectionStatus === 'connected') {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Gateway - Connected</title>
        <meta http-equiv="refresh" content="10">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: white; text-align: center; padding-top: 60px; }
          .card { background: #1e293b; max-width: 480px; margin: 0 auto; padding: 40px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #22c55e; color: white; padding: 8px 16px; border-radius: 9999px; font-weight: bold; margin-bottom: 20px; }
          h2 { margin-bottom: 8px; }
          p { color: #94a3b8; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">ONLINE & CONNECTED</div>
          <h2>Swasthya Setu WhatsApp Gateway</h2>
          <p>Logged in as: <strong>${connectedUser?.id?.split(':')[0] || 'Linked Device'}</strong></p>
          <p style="margin-top:20px; font-size: 13px; color: #64748b;">Ready to send emergency blood requests and OTPs automatically.</p>
        </div>
      </body>
      </html>
    `);
  }

  if (!currentQr) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Gateway - Initializing</title>
        <meta http-equiv="refresh" content="2">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: white; text-align: center; padding-top: 60px; }
          .card { background: #1e293b; max-width: 480px; margin: 0 auto; padding: 40px; border-radius: 16px; border: 1px solid #334155; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Initializing WhatsApp Gateway...</h2>
          <p style="color: #94a3b8;">Generating QR Code, please wait...</p>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(currentQr, { width: 320, margin: 2 });
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scan WhatsApp QR Code</title>
        <meta http-equiv="refresh" content="5">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: white; text-align: center; padding: 40px 20px; }
          .card { background: #1e293b; max-width: 500px; margin: 0 auto; padding: 32px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          img { border-radius: 12px; background: white; padding: 12px; }
          ol { text-align: left; color: #cbd5e1; font-size: 14px; line-height: 1.8; margin: 20px auto; max-width: 380px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="margin-top:0;">Link WhatsApp for Swasthya Setu</h2>
          <p style="color: #94a3b8; font-size: 14px;">Scan this QR code with WhatsApp on your phone:</p>
          <img src="${qrDataUrl}" alt="WhatsApp QR Code" />
          <ol>
            <li>Open <strong>WhatsApp</strong> on your phone</li>
            <li>Tap <strong>Menu (3 dots)</strong> or <strong>Settings</strong></li>
            <li>Tap <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong></li>
            <li>Point your camera at this QR code</li>
          </ol>
          <p style="color: #64748b; font-size: 12px;">This page refreshes automatically once linked.</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error rendering QR: ' + err.message);
  }
});

// HTTP API: Send WhatsApp Message (accepts /send-message, /send, /api/send)
app.post(['/send-message', '/send', '/api/send'], async (req, res) => {
  const targetNumber = req.body.number || req.body.phone || req.body.to;
  const textMessage = req.body.message || req.body.body || req.body.text;

  if (!targetNumber || !textMessage) {
    return res.status(400).json({
      error: 'Missing phone number or message',
      received: req.body
    });
  }

  if (connectionStatus !== 'connected' || !sock) {
    return res.status(503).json({
      error: 'WhatsApp gateway not connected yet.',
      status: connectionStatus,
      hint: `Please open http://localhost:${PORT}/qr to scan your WhatsApp QR code.`,
    });
  }

  try {
    const jid = formatJid(targetNumber);
    console.log(`[WA-SEND] Sending message to ${jid}...`);
    const sent = await sock.sendMessage(jid, { text: textMessage });

    console.log(`[WA-SEND] Successfully sent! ID: ${sent.key.id}`);
    res.json({
      success: true,
      jid,
      messageId: sent.key.id,
      timestamp: sent.messageTimestamp,
    });
  } catch (error) {
    console.error(`[WA-SEND] Error sending message to ${targetNumber}:`, error);
    res.status(500).json({ error: error.message || 'Failed to send WhatsApp message' });
  }
});

// Root redirect to /qr
app.get('/', (req, res) => {
  res.redirect('/qr');
});

// Start Express server and connect Baileys
app.listen(PORT, () => {
  console.log(`[WA-GATEWAY] HTTP Server listening on http://localhost:${PORT}`);
  console.log(`[WA-GATEWAY] Open http://localhost:${PORT}/qr in your browser to scan QR code`);
  connectToWhatsApp();
});
