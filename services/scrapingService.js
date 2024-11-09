import axios from 'axios';
import fs from 'fs';
import moment from 'moment';
import {
  MERCOS_LOGIN_EMAIL,
  MERCOS_LOGIN_PASSWORD,
} from '../config/index.js';

const loginUrl = 'https://app.mercos.com/login/';
const baseUrl1 = 'https://app.mercos.com/392509/api-online/indicadores/situacao-de-carteira/detalhado/';
const baseUrl2 = 'https://app.mercos.com/392510/api-online/indicadores/situacao-de-carteira/detalhado/';
const trocarEmpresaUrl = 'https://app.mercos.com/392509/mudar_empresa/392510/';

// Função para obter clientes inativos sem troca de empresa (dsso: false)
export async function getClientesInativos() {
  try {
    const loginData = new URLSearchParams();
    loginData.append('usuario', MERCOS_LOGIN_EMAIL);
    loginData.append('senha', MERCOS_LOGIN_PASSWORD);

    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Login
    const loginResponse = await axios.post(loginUrl, loginData, { headers });
    const cookies = loginResponse.headers['set-cookie'];

    if (!cookies) throw new Error('Falha no login');

    const dataParam = moment().format('YYYY-MM-DD');
    let clientesInativos = [];

    for (let pageNum = 1; pageNum <= 8; pageNum++) {
      const url = `${baseUrl1}?data=${dataParam}&ordenar_por=situacao%20asc,dias_sem_comprar%20desc&pagina=${pageNum}&situacoes=1&situacoes=2&situacoes=3`;
      const response = await axios.get(url, {
        headers: {
          ...headers,
          'Cookie': cookies.join('; '),
        },
      });
      let itens = response.data.itens || [];
      if (!itens.length) break;

      // Adiciona o campo dsso: false a cada item
      itens = itens.map(item => ({ ...item, dsso: false }));

      clientesInativos = clientesInativos.concat(itens);
    }

    // Salvar os dados obtidos
    return clientesInativos;
  } catch (error) {
    console.error('Erro ao obter clientes inativos:', error);
    throw error;
  }
}

// Função para obter clientes inativos com troca de empresa (dsso: true)
export async function getClientesInativosDSSO() {
  try {
    const loginData = new URLSearchParams();
    loginData.append('usuario', MERCOS_LOGIN_EMAIL);
    loginData.append('senha', MERCOS_LOGIN_PASSWORD);

    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Login
    const loginResponse = await axios.post(loginUrl, loginData, { headers });
    let cookies = loginResponse.headers['set-cookie'];

    if (!cookies) throw new Error('Falha no login');

    // Converte o array de cookies em uma string
    let cookieString = cookies.join('; ');

    // Trocar de empresa
    const trocarEmpresaResponse = await axios.get(trocarEmpresaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Cookie': cookieString,
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    // Atualiza os cookies após trocar de empresa
    const empresaCookies = trocarEmpresaResponse.headers['set-cookie'];
    if (empresaCookies) {
      cookieString += '; ' + empresaCookies.join('; ');
    }

    const dataParam = moment().format('YYYY-MM-DD');
    let clientesInativos = [];

    for (let pageNum = 1; pageNum <= 8; pageNum++) {
      const url = `${baseUrl2}?data=${dataParam}&ordenar_por=situacao%20asc,dias_sem_comprar%20desc&pagina=${pageNum}&situacoes=1&situacoes=2&situacoes=3`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Cookie': cookieString,
        },
      });
      let itens = response.data.itens || [];
      if (!itens.length) break;

      // Adiciona o campo dsso: true a cada item
      itens = itens.map(item => ({ ...item, dsso: true }));

      clientesInativos = clientesInativos.concat(itens);
    }

    // Salvar os dados obtidos
    return clientesInativos;
  } catch (error) {
    console.error('Erro ao obter clientes inativos DSSO:', error);
    throw error;
  }
}

// Função para combinar os dados e salvar no mesmo arquivo
export async function combinarEExportarClientesInativos() {
  try {
    const clientesInativos1 = await getClientesInativos();
    const clientesInativosDSSO = await getClientesInativosDSSO();

    // Combina os dados das duas funções
    const todosClientesInativos = [...clientesInativos1, ...clientesInativosDSSO];

    // Salva todos os dados no mesmo arquivo JSON
    fs.writeFileSync('./data/clientesInativos.json', JSON.stringify(todosClientesInativos, null, 2));

    console.log('Todos os dados de clientes inativos foram salvos em clientesInativos.json');
  } catch (error) {
    console.error('Erro ao combinar e exportar os dados:', error);
  }
}

