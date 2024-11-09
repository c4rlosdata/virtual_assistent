// reports.js

window.currentStartTime = null;
window.currentEndTime = null;
let interactionChart = null; // Variável global para armazenar a instância do gráfico

document.getElementById('time-filter').addEventListener('change', function() {
  const customTimeRange = document.getElementById('custom-time-range');
  if (this.value === 'custom') {
    customTimeRange.style.display = 'block';
  } else {
    customTimeRange.style.display = 'none';
  }
});

document.getElementById('apply-filter').addEventListener('click', function() {
  const selectedFilter = document.getElementById('time-filter').value;
  let startTime, endTime;

  if (selectedFilter === 'custom') {
    startTime = document.getElementById('start-time').value;
    endTime = document.getElementById('end-time').value;
  } else {
    const now = new Date();
    switch (selectedFilter) {
      case '15min':
        startTime = new Date(now.getTime() - 15 * 60000).toISOString();
        break;
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60000).toISOString();
        break;
      case '3h':
        startTime = new Date(now.getTime() - 3 * 60 * 60000).toISOString();
        break;
      case '1d':
        startTime = new Date(now.getTime() - 24 * 60 * 60000).toISOString();
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60000).toISOString();
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60000).toISOString();
        break;
    }
    endTime = now.toISOString();
  }

  fetchFilteredData(startTime, endTime);
});

async function fetchFilteredData(startTime, endTime) {
  try {
    const response = await fetch(`/api/reports/data?start=${startTime}&end=${endTime}`);
    const data = await response.json();
    renderChart(data);
  } catch (error) {
    console.error('Erro ao carregar os dados filtrados:', error);
  }
}

async function fetchReportData() {
  const response = await fetch('/api/reports/data');
  const data = await response.json();
  return data;
}

function renderChart(data) {
  const ctx = document.getElementById('interactionChart').getContext('2d');

  // Destruir o gráfico existente, se houver
  if (interactionChart) {
    interactionChart.destroy();
  }

  const chartData = {
    labels: [
      'Conversas Iniciadas pelo Bot',
      'Clientes que Responderam',
      'Pedidos Feitos',
      'Pedidos Não Processados',
      'Clientes que Recusaram',
      'Clientes que Clicaram em Suporte'
    ],
    datasets: [{
      label: 'Quantidade',
      data: [
        data.conversasIniciadasPeloBot,
        data.clientesQueResponderam,
        data.pedidosFeitos,
        data.pedidosNaoProcessados,
        data.clientesQueRecusaram,
        data.clientesQueClicaramEmSuporte
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Criar uma nova instância do gráfico e armazená-la na variável global
  interactionChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(tooltipItem) {
              return `${tooltipItem.label}: ${tooltipItem.raw}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#fff'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          event.native.target.style.cursor = 'pointer';
        } else {
          event.native.target.style.cursor = 'default';
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const chartElement = elements[0];
          const datasetIndex = chartElement.datasetIndex;
          const index = chartElement.index;
          const label = chartData.labels[index];

          // Chamar a função para buscar as conversas relacionadas
          fetchConversations(label);
        }
      }
    }
  });
}

function fetchConversations(label) {
  // Mapear o label para uma categoria específica
  let category = '';

  switch (label) {
    case 'Conversas Iniciadas pelo Bot':
      category = 'botStartedConversations';
      break;
    case 'Clientes que Responderam':
      category = 'clientsWhoReplied';
      break;
    case 'Pedidos Feitos':
      category = 'totalOrders';
      break;
    case 'Pedidos Não Processados':
      category = 'unprocessedOrders';
      break;
    case 'Clientes que Recusaram':
      category = 'clientsWhoRefused';
      break;
    case 'Clientes que Clicaram em Suporte':
      category = 'clientsWhoClickedSupport';
      break;
    default:
      return;
  }

  // Obter as datas de filtro, se aplicável
  let startTime = window.currentStartTime;
  let endTime = window.currentEndTime;

  // Remover valores inválidos ou 'null'
  if (!startTime || startTime === 'null') {
    startTime = '';
  }
  if (!endTime || endTime === 'null') {
    endTime = '';
  }

  // Construir a URL com os parâmetros adequados
  let url = `/api/reports/conversations?category=${category}`;
  if (startTime && endTime) {
    url += `&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;
  }

  // Fazer a requisição ao backend
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Chamar a função para exibir as conversas
      displayConversations(data);
    })
    .catch(error => {
      console.error('Erro ao obter as conversas:', error);
    });
}

async function fetchFilteredData(startTime, endTime) {
  // Salvar as datas atuais para uso nas requisições de conversas
  if (startTime && endTime) {
    window.currentStartTime = startTime;
    window.currentEndTime = endTime;
  } else {
    window.currentStartTime = null;
    window.currentEndTime = null;
  }

  try {
    let url = '/api/reports/data';
    if (startTime && endTime) {
      url += `?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    renderChart(data);
  } catch (error) {
    console.error('Erro ao carregar os dados filtrados:', error);
  }
}

function displayConversations(conversations) {
  // Esconder o gráfico
  const chartSection = document.querySelector('.report-section');
  chartSection.style.display = 'none';

  // Verificar se o container já existe
  let container = document.getElementById('conversationsContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'conversationsContainer';
    container.classList.add('conversations-container');

    // Adicionar um botão de voltar
    const backButton = document.createElement('button');
    backButton.textContent = 'Voltar';
    backButton.classList.add('back-button');
    backButton.addEventListener('click', function () {
      container.remove();
      chartSection.style.display = 'block';
    });
    container.appendChild(backButton);

    // Adicionar uma barra de busca (opcional)
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Procurar contatos';
    searchInput.id = 'search-input-reports';
    searchInput.addEventListener('input', filterConversations);
    container.appendChild(searchInput);

    // Criar um grid para os cards
    const messagesGrid = document.createElement('div');
    messagesGrid.id = 'messages-grid-reports';
    messagesGrid.classList.add('messages-grid');
    container.appendChild(messagesGrid);

    document.body.appendChild(container);
  }

  const messagesGrid = document.getElementById('messages-grid-reports');
  messagesGrid.innerHTML = '';

  if (conversations.length === 0) {
    messagesGrid.innerHTML = '<p>Nenhuma conversa encontrada.</p>';
  } else {
    conversations.forEach(conversation => {
      const card = createContactCard(conversation);
      messagesGrid.appendChild(card);
    });
  }
}

// Função para criar um card de contato
const createContactCard = (conversation) => {
  const card = document.createElement('div');
  card.className = 'contact-card';
  card.dataset.contato = conversation.contato;

  // Obter a última mensagem da conversa
  const lastMessage = conversation.messages[0]; // Como as mensagens estão ordenadas em ordem decrescente

  // Extrair o nome do cliente da última mensagem (se disponível)
  let nomeCliente = '';
  if (lastMessage && lastMessage.profile_whats_client) {
    nomeCliente = lastMessage.profile_whats_client.toString().trim();
  }

  // Verificar se o nome é válido
  if (nomeCliente && nomeCliente.toLowerCase() !== 'null' && nomeCliente.toLowerCase() !== 'undefined') {
    card.dataset.nome = nomeCliente;
  } else {
    card.dataset.nome = 'Nome não disponível';
  }

  // Exibir o nome do cliente
  const nameElement = document.createElement('h3');
  nameElement.textContent = card.dataset.nome;
  card.appendChild(nameElement);

  // Exibir o número do cliente sempre
  const numberElement = document.createElement('p');
  numberElement.textContent = conversation.contato;
  card.appendChild(numberElement);

  // Exibir a última mensagem
  const latestMessage = document.createElement('p');
  latestMessage.textContent = `Última mensagem: ${lastMessage ? lastMessage.conteudo : 'Sem mensagens'}`;
  card.appendChild(latestMessage);

  // Exibir a data/hora da última mensagem de forma amigável
  const timeElement = document.createElement('span');
  if (lastMessage && lastMessage.data) {
    const messageDate = new Date(lastMessage.data);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate >= today) {
      timeElement.textContent = "Hoje";
    } else if (messageDate >= yesterday && messageDate < today) {
      timeElement.textContent = "Ontem";
    } else {
      timeElement.textContent = messageDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  } else {
    timeElement.textContent = '';
  }
  timeElement.className = 'message-time';
  card.appendChild(timeElement);

  // Tornar todo o card clicável
  card.addEventListener('click', () => {
    openChatView(conversation.contato, card.dataset.nome);
  });

  return card;
};

// Função para abrir a visualização do chat
const openChatView = (contato, nomeCliente) => {
  // Passar o nome do cliente via URL codificado
  const encodedName = encodeURIComponent(nomeCliente);
  window.location.href = `chat?contato=${contato}&nome=${encodedName}`;
};


// Função para filtrar conversas conforme o texto de busca
const filterConversations = () => {
  const filterValue = document.getElementById('search-input-reports').value.toLowerCase().trim();
  const contactCards = document.querySelectorAll('#messages-grid-reports .contact-card');

  contactCards.forEach(card => {
    const contato = card.dataset.contato.toLowerCase();
    const name = card.dataset.nome.toLowerCase();

    if (contato.includes(filterValue) || name.includes(filterValue)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
};


async function init() {
  try {
    const data = await fetchReportData();
    renderChart(data);
  } catch (error) {
    console.error('Erro ao carregar os dados do relatório:', error);
    const reportSection = document.querySelector('.report-section');
    reportSection.innerHTML += `<p class="error-message">Não foi possível carregar os dados do relatório.</p>`;
  }
}

init();
