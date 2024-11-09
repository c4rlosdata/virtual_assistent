const express = require('express');
const router = express.Router();
const webhookController = require('./controllers/webhookController');

// Rota para receber webhooks do WhatsApp
router.post('/webhook', webhookController.receberWebhook);

module.exports = router;
