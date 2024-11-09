// script.js atualizado

document.addEventListener('DOMContentLoaded', () => {
  // Verificar se o usuário está logado
  const userLoggedIn = localStorage.getItem('userLoggedIn');
  if (userLoggedIn !== 'true') {
      // Se não estiver logado, redirecionar para a página de login
      window.location.href = 'login.html';
  }

  // Código original da página principal
  const messagesGrid = document.getElementById('messages-grid');
  const searchInput = document.getElementById('search-input');
  const headerIcon = document.getElementById('header-icon');

  // Função para redirecionar ao clicar no ícone de relatório
  if (headerIcon) {
      headerIcon.addEventListener('click', () => {
          window.location.href = 'reports.html'; // Substitua pelo link desejado
      });
  }

  // Função para criar um card de contato
  const createContactCard = (conversation) => {
      const card = document.createElement('div');
      card.className = 'contact-card';
      card.dataset.contato = conversation.contato;

      // Obter a última mensagem da conversa
      const lastMessage = conversation.messages[conversation.messages.length - 1];

      // Extrair o nome do cliente da última mensagem
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

  // Função para carregar conversas do servidor
  const loadConversations = () => {
      fetch('/conversations', {
          method: 'GET',
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Erro ao buscar conversas');
              }
              return response.json();
          })
          .then(conversations => {
              // Ordenar as conversas pela data da última mensagem em ordem decrescente
              conversations.sort((a, b) => {
                  const dateA = new Date(a.messages[a.messages.length - 1]?.data || 0);
                  const dateB = new Date(b.messages[b.messages.length - 1]?.data || 0);
                  return dateB - dateA;
              });

              messagesGrid.innerHTML = '';
              conversations.forEach(conversation => {
                  const card = createContactCard(conversation);
                  messagesGrid.appendChild(card);
              });
              // Atualizar a filtragem após carregar as conversas
              filterConversations();
          })
          .catch(error => {
              console.error('Erro ao carregar conversas:', error);
              messagesGrid.innerHTML = `<p>${error.message}</p>`;
          });
  };

  // Função para abrir a visualização do chat
  const openChatView = (contato, nomeCliente) => {
      // Passar o nome do cliente via URL codificado
      const encodedName = encodeURIComponent(nomeCliente);
      window.location.href = `chat?contato=${contato}&nome=${encodedName}`;
  };

  // Função para filtrar conversas conforme o texto de busca
  const filterConversations = () => {
      const filterValue = searchInput.value.toLowerCase().trim();
      const contactCards = document.querySelectorAll('.contact-card');

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

  // Adicionar evento de input para a busca
  searchInput.addEventListener('input', filterConversations);

  // Carregar as conversas ao iniciar a página
  loadConversations();
});
