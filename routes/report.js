import express from 'express';
import {
  getBotStartedConversations,
  getClientsWhoReplied,
  getTotalOrders,
  getClientsWhoRefused,
  getClientsWhoClickedSupport,
  getUnprocessedOrders,
  getBotStartedConversationsDetails,
  getClientsWhoRepliedDetails,
  getTotalOrdersDetails,
  getClientsWhoRefusedDetails,
  getClientsWhoClickedSupportDetails,
  getUnprocessedOrdersDetails,
} from '../services/reportService.js';

const router = express.Router();

router.get('/data', async (req, res) => {
  try {
    const { start, end } = req.query;

    const botStartedConversations = await getBotStartedConversations(start, end);
    const clientsWhoReplied = await getClientsWhoReplied(start, end);
    const totalOrders = await getTotalOrders(start, end);
    const clientsWhoRefused = await getClientsWhoRefused(start, end);
    const clientsWhoClickedSupport = await getClientsWhoClickedSupport(start, end);
    const unprocessedOrders = await getUnprocessedOrders(start, end); // Chamar a nova função

    const reportData = {
      conversasIniciadasPeloBot: botStartedConversations,
      clientesQueResponderam: clientsWhoReplied,
      pedidosFeitos: totalOrders,
      clientesQueRecusaram: clientsWhoRefused,
      clientesQueClicaramEmSuporte: clientsWhoClickedSupport,
      pedidosNaoProcessados: unprocessedOrders, // Incluir no objeto de resposta
    };

    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar o relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar o relatório' });
  }
});

router.get('/conversations', async (req, res) => {
  try {
    const { category, start, end } = req.query;

    // Validar as datas
    const startDate = start && !isNaN(Date.parse(start)) ? new Date(start) : null;
    const endDate = end && !isNaN(Date.parse(end)) ? new Date(end) : null;

    let conversations;

    switch (category) {
      case 'botStartedConversations':
        conversations = await getBotStartedConversationsDetails(startDate, endDate);
        break;
      case 'clientsWhoReplied':
        conversations = await getClientsWhoRepliedDetails(startDate, endDate);
        break;
      case 'totalOrders':
        conversations = await getTotalOrdersDetails(startDate, endDate);
        break;
      case 'unprocessedOrders':
        conversations = await getUnprocessedOrdersDetails(startDate, endDate);
        break;
      case 'clientsWhoRefused':
        conversations = await getClientsWhoRefusedDetails(startDate, endDate);
        break;
      case 'clientsWhoClickedSupport':
        conversations = await getClientsWhoClickedSupportDetails(startDate, endDate);
        break;
      default:
        return res.status(400).json({ error: 'Categoria inválida' });
    }

    res.json(conversations);
  } catch (error) {
    console.error('Erro ao obter as conversas:', error);
    res.status(500).json({ error: 'Erro ao obter as conversas' });
  }
});

export default router;
