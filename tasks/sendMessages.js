import fs from 'fs';
import { sendMessage } from '../services/whatsappService.js';
import { formatPhoneNumber } from '../utils/helpers.js';

const clientesInativos = JSON.parse(fs.readFileSync('./data/clientesInativos.json', 'utf-8'));

async function sendMessagesToInactiveClients() {
  for (const cliente of clientesInativos) {
    // Verificar se o cliente está inativo há 15 dias ou mais
    if (parseInt(cliente.dias_sem_comprar) >= 15) {
      const telefone = formatPhoneNumber(cliente.cliente_telefones);
      if (!telefone) {
        console.log(`Telefone inválido para o cliente ${cliente.cliente_nome_fantasia}`);
        continue;
      }
      // Montar a mensagem usando o template adequado
      const messageData = {
        messaging_product: 'whatsapp',
        to: telefone,
        type: 'template',
        template: {
          name: 'boas_vindas_di',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: cliente.cliente_nome_fantasia },
                { type: 'text', text: cliente.dias_sem_comprar.toString() },
              ],
            },
            {
              type: 'button',
              sub_type: 'quick_reply',
              index: '0',
              parameters: [
                {
                  type: 'payload',
                  payload: 'sim',
                },
              ],
            },
            {
              type: 'button',
              sub_type: 'quick_reply',
              index: '1',
              parameters: [
                {
                  type: 'payload',
                  payload: 'nao',
                },
              ],
            },
          ],
        },
      };
      try {
        await sendMessage(messageData);
        console.log(`Mensagem enviada para ${cliente.cliente_nome_fantasia}`);
      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${cliente.cliente_nome_fantasia}:`, error);
      }
    } else {
      console.log(`Cliente ${cliente.cliente_nome_fantasia} está inativo há menos de 15 dias. Ignorando.`);
    }
  }
}

(async () => {
  await sendMessagesToInactiveClients();
})();
