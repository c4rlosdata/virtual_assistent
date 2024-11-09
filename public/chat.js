// chat.js atualizado

document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chat-container');
  const contactNameElement = document.getElementById('contact-name');
  const contactNumberElement = document.getElementById('contact-number');

  console.log('contactNameElement:', contactNameElement);

  // Função para obter múltiplos parâmetros da URL
  const getQueryParams = () => {
    const params = {};
    const queryString = window.location.search.substring(1);
    const vars = queryString.split('&');
    vars.forEach((v) => {
      const pair = v.split('=');
      params[pair[0]] = decodeURIComponent(pair[1]);
    });
    return params;
  };

  // Obter os parâmetros da URL
  const params = getQueryParams();
  const contato = params['contato'];
  const nomeCliente = params['nome'] || 'Nome não disponível';

  console.log('Contato:', contato, 'Nome do cliente:', nomeCliente);

  // Verificar se o contato está presente
  if (!contato) {
    console.error('O parâmetro contato é necessário na URL.');
    chatContainer.innerHTML = '<p>Erro: número do contato não especificado.</p>';
    return;
  }

  // Atualizar o nome e número do contato no topo da página
  contactNameElement.textContent = nomeCliente;
  contactNumberElement.textContent = contato;

  // Função para criar um balão de mensagem
  const createMessageBubble = (message) => {
    const messageElement = document.createElement('div');

    // Determinar quem enviou a mensagem
    if (message.quem_enviou === contato) {
      // Mensagem enviada pelo contato (cliente)
      messageElement.className = 'message-bubble user';
    } else {
      // Mensagem enviada pelo atendente ou sistema
      messageElement.className = 'message-bubble bot';
    }

    const content = document.createElement('p');
    content.textContent = message.conteudo;
    messageElement.appendChild(content);

    const date = document.createElement('span');
    date.className = 'message-date';
    const dateObject = new Date(message.data);
    if (!isNaN(dateObject.getTime())) {
      const formattedDate = dateObject.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      date.textContent = formattedDate;
    } else {
      date.textContent = 'Data inválida';
    }

    messageElement.appendChild(date);
    return messageElement;
  };

  // Função para carregar as mensagens da conversa específica
  const loadConversation = () => {
    fetch(`/conversation?contato=${contato}`, {
      method: 'GET',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar a conversa');
        }
        return response.json();
      })
      .then(conversation => {
        chatContainer.innerHTML = '';

        // Renderizar as mensagens
        conversation.messages.forEach((message) => {
          const messageElement = createMessageBubble(message);
          chatContainer.appendChild(messageElement);
        });

        // Scroll automático para a última mensagem
        chatContainer.scrollTop = chatContainer.scrollHeight;
      })
      .catch(error => {
        console.error('Erro ao carregar a conversa:', error);
        chatContainer.innerHTML = `<p>${error.message}</p>`;
      });
  };

  // Carregar a conversa ao iniciar a página
  loadConversation();
});
