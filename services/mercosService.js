import axios from 'axios';
import { MERCOS_APPLICATION_TOKEN } from '../config/index.js';

const API_BASE_URL = 'https://app.mercos.com/api/v2';

export async function getLastOrder(ultimo_pedido_id, companyToken, retryCount = 0) {
  try {
    const response = await axios.get(`${API_BASE_URL}/pedidos/${ultimo_pedido_id}`, {
      headers: {
        'Content-Type': 'application/json',
        'ApplicationToken': MERCOS_APPLICATION_TOKEN,
        'CompanyToken': companyToken,
      },
    });
    const pedido = response.data;
    console.log('Pedido obtido:', JSON.stringify(pedido, null, 2));
    return pedido;
  } catch (error) {
    if (error.response && error.response.status === 429 && retryCount < 5) {
      const retryAfter = error.response.data.tempo_ate_permitir_novamente || 5;
      console.warn(`Limite de requisições excedido, tentando novamente em ${retryAfter} segundos...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return getLastOrder(ultimo_pedido_id, companyToken, retryCount + 1);
    } else {
      console.error('Erro ao obter o último pedido:', error.response?.data || error.message);
      throw error;
    }
  }
}

export async function createOrder(clienteId, itens, condicaoPagamento, companyToken, retryCount = 0) {
  try {
    const response = await axios.post(`${API_BASE_URL}/pedidos`, {
      cliente_id: clienteId,
      data_emissao: new Date().toISOString().split('T')[0],
      condicao_pagamento: condicaoPagamento,
      observacoes: 'pedido feito via whatsapp',
      itens: itens,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'ApplicationToken': MERCOS_APPLICATION_TOKEN,
        'CompanyToken': companyToken,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429 && retryCount < 5) {
      const retryAfter = error.response.data.tempo_ate_permitir_novamente || 5;
      console.warn(`Limite de requisições excedido, tentando novamente em ${retryAfter} segundos...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return createOrder(clienteId, itens, condicaoPagamento, companyToken, retryCount + 1);
    } else {
      console.error('Erro ao criar o pedido:', error.response?.data || error.message);
      throw error;
    }
  }
}
