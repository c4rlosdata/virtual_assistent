// app.js

import express from 'express';
import path, { dirname } from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import sequelize from './config/index.js'; // Conexão com o banco de dados
import { Op, Sequelize } from 'sequelize';
import Message from './models/Message.js'; // Modelo de mensagens
import reportRoutes from './routes/report.js'; // Importe a rota de relatórios

// Importar rotas
import webhookRoutes from './routes/webhook.js'; // Rotas para o webhook

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Obter o diretório atual (necessário para __dirname com ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;

const app = express();

// Middlewares
app.use(bodyParser.json()); // Necessário para lidar com JSON no corpo da requisição
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.resolve('public')));

// Servir a página principal
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

// Servir a página de chat
app.get('/chat', (req, res) => {
  res.sendFile(path.resolve('public', 'chat.html'));
});

// Registrar rotas existentes
app.use('/webhook', webhookRoutes);
app.use('/api/reports', reportRoutes); // Use a rota '/api/reports/data'

// ===========================
// Adicionar as rotas para conversas

// Rota para obter todas as conversas
app.get('/conversations', async (req, res) => {
  try {
    // Obter todos os números de contatos únicos (clientes)
    const clientes = await Message.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('numero_cliente')), 'contato']
      ],
      where: {
        numero_cliente: { [Op.ne]: null }, // Garantir que o número do cliente não seja nulo
      },
      raw: true,
    });

    // Extrair os números de contato
    const contatos = clientes.map(cliente => cliente.contato);

    // Obter detalhes das conversas
    const conversations = await Promise.all(contatos.map(async (contato) => {
      // Obter todas as mensagens (enviadas ou recebidas) para esse contato
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { quem_enviou: contato },
            { quem_recebeu: contato },
          ],
        },
        order: [['data', 'ASC']],
        attributes: ['tipo', 'conteudo', 'data', 'quem_enviou', 'quem_recebeu', 'profile_whats_client'],
      });

      console.log(`Processando contato: ${contato}`);

      // Obter o profile_whats_client da última mensagem recebida com nome não nulo
      const lastReceivedMessageWithProfile = await Message.findOne({
        where: {
          numero_cliente: contato,
          tipo: 'received',
          profile_whats_client: { [Op.ne]: null },
        },
        order: [['data', 'DESC']],
      });
      
      const profileName = lastReceivedMessageWithProfile
        ? lastReceivedMessageWithProfile.profile_whats_client
        : null;

      console.log(`Contato: ${contato}, Nome Recuperado: ${profileName}`);

      return {
        contato,
        profile_whats_client: profileName,
        messages,
      };
    }));

    res.json(conversations);
  } catch (error) {
    console.error('Erro ao obter as conversas:', error.message);
    res.status(500).json({ error: 'Erro ao obter as conversas' });
  }
});


// Rota para obter uma conversa específica
app.get('/conversation', async (req, res) => {
  const contato = req.query.contato;

  if (!contato) {
    return res.status(400).json({ error: 'O parâmetro contato é necessário' });
  }

  try {
    const messages = await Message.findAll({
      where: {
        numero_cliente: contato,
      },
      order: [['data', 'ASC']],
      attributes: ['tipo', 'conteudo', 'data', 'quem_enviou', 'quem_recebeu'],
    });

    res.json({ contato, messages });
  } catch (error) {
    console.error('Erro ao carregar a conversa:', error.message);
    res.status(500).json({ error: 'Erro ao carregar a conversa' });
  }
});
// ===========================

// Servir a página de relatórios
app.get('/reports', (req, res, next) => {
  // Se a rota for chamada via navegador, servir o HTML
  if (req.accepts('html')) {
    res.sendFile(path.resolve('public', 'reports.html'));
  } else {
    // Se for uma chamada via fetch API, passar para a próxima rota (endpoint JSON)
    next();
  }
});

// Sincronizar o banco de dados e iniciar o servidor
async function startServer() {
  try {
    // Sincronizar todos os modelos com o banco de dados
    await sequelize.sync();
    console.log('Banco de dados sincronizado com sucesso!');
    
    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  }
}

// Iniciar o servidor e sincronizar o banco de dados
startServer();
