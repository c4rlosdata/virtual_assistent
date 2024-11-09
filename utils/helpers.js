import fs from 'fs';
import { sendMessage } from '../services/whatsappService.js';
import { getSellerPhone } from './sellerUtils.js'; 
import { getLastOrder} from '../services/mercosService.js';
import { MERCOS_COMPANY_TOKEN, MERCOS_COMPANY_TOKEN_DSSO } from '../config/index.js';

const clientesInativos = JSON.parse(fs.readFileSync('./data/clientesInativos.json', 'utf-8'));

const productMapping = JSON.parse(fs.readFileSync('./data/product_mapping.json', 'utf-8'));

export function getClientByPhone(phone) {
  const cliente = clientesInativos.find(cliente => {
    let telefone = cliente.cliente_telefones;

    if (!telefone) {
      console.warn(`Telefone não definido para o cliente ${cliente.cliente_nome_fantasia}`);
      return false;
    }

    telefone = telefone.replace(/\D/g, '');

    if (telefone.startsWith('0')) telefone = telefone.substring(1);
    if (!telefone.startsWith('55')) telefone = '55' + telefone;

    return telefone === phone;
  });

  return cliente;
}


export function formatPhoneNumber(telefone) {
  if (!telefone) return null;
  telefone = telefone.replace(/\D/g, '');
  if (telefone.startsWith('0')) telefone = telefone.substring(1);
  if (!telefone.startsWith('55')) telefone = '55' + telefone;
  return telefone;
}



// Implementação das funções auxiliares

export async function contactSupport(to) {
  try {
    const supportNumber = '5521985814963'; // Substitua pelo número de suporte real
    const supportMessage = `Você pode entrar em contato com nosso suporte através do seguinte link: https://wa.me/${supportNumber}`;
    await sendMessage({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: supportMessage,
      },
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem de suporte:', error);
  }
}


export async function sendOrderOptions(to) {
  const messageData = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'Olá, tudo bem? Sou a *DI*, sua assistente virtual que te ajuda a realizar seu pedido. Aqui estão as opções para você:',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'repetir_pedido',
              title: 'Repetir Pedido',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'escolher_produtos',
              title: 'Escolher Produtos',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'contactar_suporte',
              title: 'Falar com Atendente',
            },
          },
        ],
      },
    },
  };

  try {
    await sendMessage(messageData);
  } catch (error) {
    console.error('Erro ao enviar opções de pedido:', error);
  }
}

export async function startProductSelection(to) {
  try {
    const client = getClientByPhone(to);
    if (!client) {
      console.error(`Cliente não encontrado para o número ${to}`);
      await sendDefaultMessage(to);
      return;
    }

    // Determinar qual CompanyToken usar
    const companyToken = client.dsso ? MERCOS_COMPANY_TOKEN_DSSO : MERCOS_COMPANY_TOKEN;

    // Obter o último pedido do cliente
    const lastOrder = await getLastOrder(client.ultimo_pedido_id, companyToken);
    if (!lastOrder || !lastOrder.itens || lastOrder.itens.length === 0) {
      console.error(`Não foi possível obter o último pedido ou não há itens.`);
      await sendMessage({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: 'Não consegui processar seu pedido. Por favor, fale com nosso suporte.'
        },
      });
      return;
    }

    // Extrair o tabela_preco_id do primeiro item (assumindo que é o mesmo para todos os itens)
    const tabelaPrecoId = lastOrder.itens[0].tabela_preco_id;
    console.log(`Tabela de Preço ID obtido: ${tabelaPrecoId}`);

    // Atribuir o tabela_preco_id ao objeto client
    client.tabela_preco_id = tabelaPrecoId;

    const catalogId = '457811017283227'; // Substitua pelo ID do seu catálogo unificado

    // Obter os produtos correspondentes à tabela de preços do cliente
    const produtosCliente = Object.keys(productMapping).filter(retailerId => {
      const productInfo = productMapping[retailerId];
      return productInfo.tabela_preco_id === client.tabela_preco_id;
    });

    // Se não houver produtos para a tabela de preços do cliente
    if (produtosCliente.length === 0) {
      console.error(`Nenhum produto encontrado para a tabela de preços ${client.tabela_preco_id}`);
      await sendMessage({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: 'Desculpe, não encontramos produtos disponíveis para você no momento. Por favor, entre em contato com o suporte.'
        },
      });
      return;
    }

    // Criar a lista de produtos para enviar
    const productItems = produtosCliente.map(retailerId => ({
      product_retailer_id: retailerId,
    }));

    // Montar a mensagem com o catalog_id correto
    const messageData = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'product_list',
        header: {
          type: 'text',
          text: 'Por favor, selecione os produtos que deseja adicionar'
        },
        body: {
          text: 'Escolha entre os produtos abaixo:'
        },
        footer: {
          text: 'Aguardamos sua seleção'
        },
        action: {
          catalog_id: catalogId,
          sections: [
            {
              title: 'Produtos Disponíveis',
              product_items: productItems
            }
          ]
        }
      }
    };

    console.log('Enviando mensagem:', JSON.stringify(messageData, null, 2));
    await sendMessage(messageData);
  } catch (error) {
    console.error('Erro ao iniciar seleção de produtos:', error);
    await sendMessage({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: 'Não consegui processar seu pedido. Por favor, fale com nosso suporte.'
      },
    });
  }
}

export async function notifySeller(from) {  // substituir esse template por uma mensagem do meta
  try {
    const client = getClientByPhone(from);
    if (!client) {
      console.error(`Cliente não encontrado para o número ${from}`);
      await sendDefaultMessage(from);
      return;
    }

    // Enviar mensagem ao cliente informando que entendemos
    await sendMessage({
      messaging_product: 'whatsapp',
      to: from,
      type: 'template',
      template: {
        name: 'notify_sellers',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: client.cliente_nome_fantasia },
            ],
          },
        ],
      },
    });

    // Verificar se o vendedor está definido
    if (!client.vendedor_id_ultimo_pedido) {
      console.error(`ID do vendedor não encontrado para o cliente ${client.cliente_nome_fantasia}`);
      return;
    }

    // Notificar o vendedor responsável
    const sellerPhone = "5521985814963";
    if (!sellerPhone) {
      console.error(`Telefone do vendedor não encontrado para o cliente ${client.cliente_nome_fantasia}`);
      return;
    }

    await sendMessage({
      messaging_product: 'whatsapp',
      to: sellerPhone,
      type: 'text',
      text: {
        body: `O cliente ${client.cliente_nome_fantasia} não deseja fazer um novo pedido no momento. Por favor, entre em contato para mais informações.`,
      },
    });
  } catch (error) {
    console.error('Erro ao notificar o vendedor:', error);
  }
}



export async function sendDefaultMessage(to) {
  await sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: 'Não consegui processar seu pedido, seu número de telefone não está cadastrado em nossa base de dados. Por favor, clique em falar com atendente humano que iremos lhe ajudar a fazer seu pedido!' },
  });
}
