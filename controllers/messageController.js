import { sendMessage as sendWhatsAppMessageService } from '../services/whatsappService.js'; // Pensar em enviar template quando o cliente mandar alguma mensagem específica
import Message from '../models/Message.js';
import {processOrderMessage, repeatLastOrder, addProductToOrder, finalizeOrder} from '../controllers/orderController.js'
import { sendOrderOptions, notifySeller, startProductSelection, sendDefaultMessage, contactSupport } from '../utils/helpers.js';

export async function webhookHandler(req, res) {
  try {
    console.log('Webhook recebido:', JSON.stringify(req.body, null, 2));

    const body = req.body;

    if (body.object) {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const messages = changes?.value?.messages?.[0];
      const contacts = changes?.value?.contacts?.[0];

      if (messages) {
        console.log('Mensagem recebida:', JSON.stringify(messages, null, 2));

        const from = messages.from;
        const messageType = messages.type;
        let content = '';

        // Extrair o nome do perfil do cliente
        const profileName = contacts?.profile?.name || null;
        console.log('Nome do Cliente Recebido:', profileName);

        // Extrair o conteúdo da mensagem com base no tipo
        switch (messageType) {
          case 'text':
            content = messages.text?.body || '';
            break;
          case 'button':
            content = messages.button?.text || '';
            break;
          case 'interactive':
            if (messages.interactive.type === 'button_reply') {
              content = messages.interactive.button_reply.title || '';
            } else if (messages.interactive.type === 'product_list_reply') {
              content = `Produto ID: ${messages.interactive.product_list_reply.product_retailer_id}`;
            }
            break;
          case 'order':
            content = `Pedido recebido com ${messages.order.product_items.length} itens.`;
            break;
          default:
            content = 'Tipo de mensagem não suportado.';
        }

        // Salvar a mensagem recebida no banco de dados
        await Message.create({
          tipo: 'received',
          conteudo: content,
          quem_enviou: from,
          quem_recebeu: changes.value.metadata.display_phone_number,
          profile_whats_client: profileName,
          numero_cliente: from, // Certifique-se de que está salvando o número do cliente
        });

        // Processar a mensagem
        await handleClientResponse(from, messages);
        res.sendStatus(200);
      } else {
        console.log('Nenhuma mensagem encontrada no webhook.');
        res.sendStatus(200);
      }
    } else {
      console.log('Objeto desconhecido no webhook.');
      res.sendStatus(200);
    }
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.sendStatus(500);
  }
}


export async function handleClientResponse(from, message) {
  console.log(`Processando mensagem de ${from}:`, JSON.stringify(message, null, 2));

  const messageType = message.type;
  if (messageType === 'text') {
    const msgBody = message.text.body.toLowerCase();
    if (msgBody.includes('sim')) {
      await sendOrderOptions(from);
    } else if (msgBody.includes('não') || msgBody.includes('nao')) {
      await notifySeller(from);
    } else {
      await sendOrderOptions(from);
    }
  } 
  
  else if (messageType === 'button') {
    const buttonPayload = message.button.payload;
    console.log(`Botão pressionado com payload: ${buttonPayload}`);
    if (buttonPayload === 'sim') {
      await sendOrderOptions(from);
    } else if (buttonPayload === 'nao') {
      await notifySeller(from);
    } else if (buttonPayload === 'repetir_pedido') {
      await repeatLastOrder(from);
    } else if (buttonPayload === 'escolher_produtos') {
      await startProductSelection(from);
    } else if (buttonPayload === 'adicionar_mais') {
      await startProductSelection(from);
    } else if (buttonPayload === 'finalizar_pedido') {
      await finalizeOrder(from);
    } else {
      await sendDefaultMessage(from);
    }
  }
  
  else if (messageType === 'interactive') {
    const interactiveType = message.interactive.type;
    if (interactiveType === 'button_reply') {
      const buttonId = message.interactive.button_reply.id;
      if (buttonId === 'sim') {
        await sendOrderOptions(from);
      } else if (buttonId === 'nao') {
        await notifySeller(from);
      }else if (buttonId === 'contactar_suporte') {
        await contactSupport(from);
      }else if (buttonId === 'repetir_pedido') {
        await repeatLastOrder(from);
      } else if (buttonId === 'escolher_produtos') {
        await startProductSelection(from);
      } else if (buttonId === 'adicionar_mais') {
        await startProductSelection(from);
      } else if (buttonId === 'finalizar_pedido') {
        await finalizeOrder(from);
      }
    } else if (interactiveType === 'product_list_reply') {
      const productId = message.interactive.product_list_reply.product_retailer_id;
      await addProductToOrder(from, productId);
    } else if (interactiveType === 'product') {
      const productId = message.interactive.product.product_retailer_id;
      await addProductToOrder(from, productId);
    }
  }

  else if (messageType === 'order') {
    await processOrderMessage(from, message.order);
  } 

  else {
    await sendDefaultMessage(from);
  }
}