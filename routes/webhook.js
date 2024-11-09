import express from 'express';
import { webhookHandler } from '../controllers/messageController.js';
import { VERIFY_TOKEN } from '../config/index.js';

const router = express.Router();

// Endpoint para verificar o webhook
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

// Endpoint para processar o webhook
router.post('/', webhookHandler);

export default router;
