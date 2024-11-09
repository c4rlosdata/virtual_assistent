import fs from 'fs';
import { sendMessage } from '../services/whatsappService.js';
import { getClientByPhone, sendDefaultMessage} from '../utils/helpers.js';
import { getLastOrder, createOrder } from '../services/mercosService.js';
import { MERCOS_COMPANY_TOKEN, MERCOS_COMPANY_TOKEN_DSSO } from '../config/index.js';

const productMapping = JSON.parse(fs.readFileSync('./data/product_mapping.json', 'utf-8'));

export async function processOrderMessage(from, orderData) {
  try {
    const client = getClientByPhone(from);
    if (!client) {
      console.error(`Cliente não encontrado para o número ${from}`);
      await sendDefaultMessage(from);
      return;
    }

    // Determinar qual CompanyToken usar
    const companyToken = client.dsso ? MERCOS_COMPANY_TOKEN_DSSO : MERCOS_COMPANY_TOKEN;

    // Obter o último pedido do cliente para a condição de pagamento
    const lastOrder = await getLastOrder(client.ultimo_pedido_id, companyToken);
    let condicaoPagamento = 'PIX';
    if (lastOrder && lastOrder.condicao_pagamento) {
      condicaoPagamento = lastOrder.condicao_pagamento;
    }

    // Processar os itens do pedido
    const productItems = orderData.product_items;
    const itens = [];

    for (const item of productItems) {
      const retailerId = item.product_retailer_id;

      // Obter o mapeamento do produto
      const productInfo = productMapping[retailerId];
      if (!productInfo) {
        console.error(`Produto com retailer_id ${retailerId} não encontrado no mapeamento`);
        continue; // Ou trate o erro conforme necessário
      }

      // Verificar se a tabela de preços corresponde à do cliente
      if (productInfo.tabela_preco_id !== client.tabela_preco_id) {
        console.warn(`Tabela de preços do produto não corresponde à do cliente para retailer_id ${retailerId}`);
        // Você pode optar por ignorar o produto ou ajustar conforme necessário
      }

      itens.push({
        produto_id: productInfo.produto_id,
        quantidade: item.quantity, // Ajuste a quantidade conforme necessário
        preco_tabela: item.item_price, // Você pode usar o preço do item ou obter o preço da tabela
        tabela_preco_id: productInfo.tabela_preco_id,
      });
    }

    // Criar o pedido no MERCOS
    const newOrder = await createOrder(client.cliente_id, itens, condicaoPagamento, companyToken);
    console.log('Pedido criado no MERCOS:', newOrder);

    // Enviar confirmação ao cliente
    await sendMessage({
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: 'Seu pedido foi realizado com sucesso! Obrigada.' },
    });
  } catch (error) {
    console.error('Erro ao processar o pedido:', error);
    await sendMessage({
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: 'Não consegui processar seu pedido. Por favor, fale com nosso suporte.' },
    });
  }
}



export async function repeatLastOrder(from) {
  try {
    const client = getClientByPhone(from);
    if (!client) {
      console.error(`Cliente não encontrado para o número ${from}`);
      await sendDefaultMessage(from);
      return;
    }

    const companyToken = client.dsso ? MERCOS_COMPANY_TOKEN_DSSO : MERCOS_COMPANY_TOKEN;

    // Obter o último pedido do cliente
    const lastOrder = await getLastOrder(client.ultimo_pedido_id, companyToken);
    if (!lastOrder) {
      await sendMessage({
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: 'Não encontramos um pedido anterior para repetir. Por favor, escolha novos produtos.' },
      });
      await startProductSelection(from);
      return;
    }

    // Criar um novo pedido baseado no último pedido
    const itensFiltrados = lastOrder.itens.map(item => ({
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_tabela: item.preco_tabela,
    }));

    const condicaoPagamento = lastOrder.condicao_pagamento || 'PIX';

    const newOrder = await createOrder(client.cliente_id, itensFiltrados, condicaoPagamento, companyToken);
    await sendMessage({
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: 'Seu pedido foi realizado com sucesso! Obrigada.' },
    });
  } catch (error) {
    console.error('Erro ao repetir o último pedido:', error.response?.data || error.message);
    await sendMessage({
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: 'Não consegui processar seu pedido, seu número de telefone não está cadastrado em nossa base de dados. Por favor, clique em falar com atendente humano que iremos lhe ajudar a fazer seu pedido!' },
    });
  }
}



export async function addProductToOrder(from, productId) {
  console.log(`Adicionando produto ${productId} ao pedido do cliente ${from}`);

  if (!clientOrders[from]) {
    clientOrders[from] = [];
  }

  clientOrders[from].push(productId);

  // Perguntar se o cliente deseja adicionar mais produtos ou finalizar o pedido
  const messageData = {
    messaging_product: 'whatsapp',
    to: from,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'Produto adicionado ao seu pedido. Deseja adicionar mais produtos ou finalizar o pedido?'
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'adicionar_mais',
              title: 'Adicionar Mais'
            }
          },
          {
            type: 'reply',
            reply: {
              id: 'finalizar_pedido',
              title: 'Finalizar Pedido'
            }
          }
        ]
      }
    }
  };

  try {
    await sendMessage(messageData);
  } catch (error) {
    console.error('Erro ao enviar mensagem de confirmação:', error);
  }
}


export async function finalizeOrder(from) {
  try {
    const client = getClientByPhone(from);
    if (!client) {
      console.error(`Cliente não encontrado para o número ${from}`);
      await sendDefaultMessage(from);
      return;
    }

    const companyToken = client.dsso ? MERCOS_COMPANY_TOKEN_DSSO : MERCOS_COMPANY_TOKEN;

    const products = clientOrders[from];
    if (!products || products.length === 0) {
      await sendMessage({
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: 'Seu pedido está vazio. Por favor, selecione produtos para adicionar.' },
      });
      return;
    }

    // Obter o último pedido para a condição de pagamento
    const lastOrder = await getLastOrder(client.ultimo_pedido_id, companyToken);
    let condicaoPagamento = 'PIX';
    if (lastOrder && lastOrder.condicao_pagamento) {
      condicaoPagamento = lastOrder.condicao_pagamento;
    }

    // Criar o pedido
    const itens = products.map(productId => ({
      produto_id: parseInt(productId),
      quantidade: 1,
      preco_tabela: 0,
    }));

    const newOrder = await createOrder(client.cliente_id, itens, condicaoPagamento, companyToken);

    // Limpar o pedido do cliente
    delete clientOrders[from];

    // Enviar confirmação
    await sendMessage({
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: 'Seu pedido foi realizado com sucesso! Obrigada.' },
    });
  } catch (error) {
    console.error('Erro ao finalizar o pedido:', error);
    await sendMessage({
      messaging_product: 'whatsapp',
      to: from,
      type: 'text',
      text: { body: 'Não consegui processar seu pedido, seu número de telefone não está cadastrado em nossa base de dados. Por favor, clique em falar com atendente humano que iremos lhe ajudar a fazer seu pedido!' },
    });
  }
}
