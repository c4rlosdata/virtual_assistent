import fetch from 'node-fetch';
import { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID } from '../config/index.js';
import Message from '../models/Message.js';
import { Op } from 'sequelize';

const headers = {
  'Authorization': `Bearer EAF6hVGvWfgQBOyZA9db5E63HfOw5Ca4jWOS9Pc2UNs3ZCNwoxsB5vLOWHtZA5hA73OhlXZCuxTFYZAbys5RVcPo3ud7P4KIqnZC1szqs6KZBgEB2Syf4xiTZCbjMkCL3EZCPPBJm7ASKKIOpQIGsF2Y7s0ZAzDsZA6f7xY5jwzobl8naGkZCI0gnSYKJiuhuP64iNPXZBBDpna5ZCZAYc3qG6s8AfsEAjFMO31R8dZAZAnP5yvtcZD`,
  'Content-Type': 'application/json',
};

export async function sendMessage(data) {
  try {
    console.log('Enviando mensagem:', JSON.stringify(data, null, 2));

    // Corpo da mensagem a ser enviada pela API do WhatsApp
    const body = {
      ...data,
      messaging_product: 'whatsapp',
    };

    // Enviar a mensagem usando a API do WhatsApp
    const response = await fetch(`https://graph.facebook.com/v20.0/391598487380790/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ${response.status}: ${JSON.stringify(errorData)}`);
    }

    console.log('Mensagem enviada com sucesso:', response.status);

    // Após enviar a mensagem, registrar no banco de dados
    let messageContent = '';

    // Verificar o tipo de mensagem para definir o conteúdo que será registrado
    if (data.type === 'text') {
      messageContent = data.text.body;
    } else if (data.type === 'interactive' && data.interactive.body) {
      messageContent = data.interactive.body.text; // Para mensagens interativas
    } else if (data.type === 'template' && data.template.name) {
      messageContent = `Template: ${data.template.name}`; // Registrar o nome do template
    } else {
      messageContent = 'Mensagem enviada';
    }

    // Verificar se o número do WhatsApp Business está definido corretamente
    const quemEnviou = process.env.WHATSAPP_BUSINESS_NUMBER || 'numero_indefinido'; // Adicionar valor padrão

    // Tentar obter o nome do perfil do cliente a partir da última mensagem recebida
    const lastReceivedMessage = await Message.findOne({
      where: {
        quem_enviou: data.to,
        tipo: 'received',
        profile_whats_client: {
          [Op.ne]: null // Garantir que tenha um nome de perfil registrado
        }
      },
      order: [['data', 'DESC']], // Ordenar pela data para pegar a última mensagem
    });

    // Se houver uma mensagem recebida anterior, usar o nome do perfil dessa mensagem
    const profileName = lastReceivedMessage ? lastReceivedMessage.profile_whats_client : null;

    // Salvar no banco de dados
    await Message.create({
      tipo: 'sent',
      conteudo: messageContent,
      quem_enviou: quemEnviou, // Usar valor padrão se a variável de ambiente estiver ausente
      quem_recebeu: data.to,
      profile_whats_client: profileName, // Salvar o nome do perfil se estiver disponível
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
    throw new Error(`Erro ao enviar mensagem: ${error.message}`);
  }
}
