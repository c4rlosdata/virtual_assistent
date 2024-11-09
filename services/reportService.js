// services/reportService.js

import { Op, Sequelize } from 'sequelize';
import Message from '../models/Message.js';

export async function getBotStartedConversations(start, end) {
  // Quantas conversas o bot começou
  const whereClause = {
    tipo: 'sent',
  };

  if (start && end) {
    whereClause.data = {
      [Op.between]: [new Date(start), new Date(end)],
    };
  }

  const result = await Message.findAll({
    where: whereClause,
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('quem_recebeu')), 'cliente_numero'],
    ],
    group: ['quem_recebeu'],
  });
  return result.length;
}

export async function getBotStartedConversationsDetails(start, end) {
  const whereClause = {
    tipo: 'sent',
  };

  if (start instanceof Date && end instanceof Date) {
    whereClause.data = {
      [Op.between]: [start, end],
    };
  }

  const messages = await Message.findAll({
    where: whereClause,
    attributes: [
      'id',
      'tipo',
      'conteudo',
      'quem_enviou',
      'quem_recebeu',
      'data',
      'profile_whats_client',
    ],
    order: [['data', 'DESC']],
  });

  // Agrupar mensagens por 'quem_recebeu' (número do cliente)
  const conversationsMap = new Map();

  for (const message of messages) {
    const contato = message.quem_recebeu;
    if (!conversationsMap.has(contato)) {
      conversationsMap.set(contato, {
        contato: contato,
        messages: [],
      });
    }
    conversationsMap.get(contato).messages.push(message);
  }

  const conversations = Array.from(conversationsMap.values());

  return conversations;
}

export async function getClientsWhoReplied(start, end) {
  // Quantos clientes responderam
  const whereClause = {
    tipo: 'received',
  };

  if (start && end) {
    whereClause.data = {
      [Op.between]: [new Date(start), new Date(end)],
    };
  }

  const result = await Message.findAll({
    where: whereClause,
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('quem_enviou')), 'cliente_numero'],
    ],
    group: ['quem_enviou'],
  });
  return result.length;
}

export async function getClientsWhoRepliedDetails(start, end) {
  const whereClause = {
    tipo: 'received',
  };

  if (start instanceof Date && end instanceof Date) {
    whereClause.data = {
      [Op.between]: [start, end],
    };
  }

  const messages = await Message.findAll({
    where: whereClause,
    attributes: [
      'id',
      'tipo',
      'conteudo',
      'quem_enviou',
      'quem_recebeu',
      'data',
      'profile_whats_client',
    ],
    order: [['data', 'DESC']],
  });

  // Agrupar mensagens por 'quem_enviou' (número do cliente)
  const conversationsMap = new Map();

  for (const message of messages) {
    const contato = message.quem_enviou;
    if (!conversationsMap.has(contato)) {
      conversationsMap.set(contato, {
        contato: contato,
        messages: [],
      });
    }
    conversationsMap.get(contato).messages.push(message);
  }

  const conversations = Array.from(conversationsMap.values());

  return conversations;
}

export async function getTotalOrders(start, end) {
  // Quantos pedidos foram feitos
  const whereClause = {
    tipo: 'sent',
    conteudo: {
      [Op.like]: '%Seu pedido foi realizado com sucesso%',
    },
  };

  if (start && end) {
    whereClause.data = {
      [Op.between]: [new Date(start), new Date(end)],
    };
  }

  const count = await Message.count({
    where: whereClause,
  });
  return count;
}

export async function getTotalOrdersDetails(start, end) {
  const whereClause = {
    tipo: 'sent',
    conteudo: {
      [Op.like]: '%Seu pedido foi realizado com sucesso%',
    },
  };

  if (start instanceof Date && end instanceof Date) {
    whereClause.data = {
      [Op.between]: [start, end],
    };
  }

  const messages = await Message.findAll({
    where: whereClause,
    attributes: [
      'id',
      'tipo',
      'conteudo',
      'quem_enviou',
      'quem_recebeu',
      'data',
      'profile_whats_client',
    ],
    order: [['data', 'DESC']],
  });

  // Agrupar mensagens por 'quem_recebeu' (número do cliente)
  const conversationsMap = new Map();

  for (const message of messages) {
    const contato = message.quem_recebeu;
    if (!conversationsMap.has(contato)) {
      conversationsMap.set(contato, {
        contato: contato,
        messages: [],
      });
    }
    conversationsMap.get(contato).messages.push(message);
  }

  const conversations = Array.from(conversationsMap.values());

  return conversations;
}

export async function getClientsWhoRefused(start, end) {
  // Quantos clientes se recusaram a fazer o pedido
  const whereClause = {
    tipo: 'received',
    conteudo: {
      [Op.or]: [
        { [Op.iLike]: '%não%' },
        { [Op.iLike]: '%nao%' },
      ],
    },
  };

  if (start && end) {
    whereClause.data = {
      [Op.between]: [new Date(start), new Date(end)],
    };
  }

  const result = await Message.findAll({
    where: whereClause,
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('quem_enviou')), 'cliente_numero'],
    ],
    group: ['quem_enviou'],
  });
  return result.length;
}

export async function getClientsWhoRefusedDetails(start, end) {
  const whereClause = {
    tipo: 'received',
    conteudo: {
      [Op.or]: [
        { [Op.iLike]: '%não%' },
        { [Op.iLike]: '%nao%' },
      ],
    },
  };

  if (start instanceof Date && end instanceof Date) {
    whereClause.data = {
      [Op.between]: [start, end],
    };
  }

  const messages = await Message.findAll({
    where: whereClause,
    attributes: [
      'id',
      'tipo',
      'conteudo',
      'quem_enviou',
      'quem_recebeu',
      'data',
      'profile_whats_client',
    ],
    order: [['data', 'DESC']],
  });

  // Agrupar mensagens por 'quem_enviou' (número do cliente)
  const conversationsMap = new Map();

  for (const message of messages) {
    const contato = message.quem_enviou;
    if (!conversationsMap.has(contato)) {
      conversationsMap.set(contato, {
        contato: contato,
        messages: [],
      });
    }
    conversationsMap.get(contato).messages.push(message);
  }

  const conversations = Array.from(conversationsMap.values());

  return conversations;
}

export async function getClientsWhoClickedSupport(start, end) {
  // Quantos clientes apertaram o botão suporte
  const whereClause = {
    tipo: 'received',
    conteudo: 'Falar com Atendente',
  };

  if (start && end) {
    whereClause.data = {
      [Op.between]: [new Date(start), new Date(end)],
    };
  }

  const result = await Message.findAll({
    where: whereClause,
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('quem_enviou')), 'cliente_numero'],
    ],
    group: ['quem_enviou'],
  });
  return result.length;
}

export async function getClientsWhoClickedSupportDetails(start, end) {
  const whereClause = {
    tipo: 'received',
    conteudo: 'Falar com Atendente',
  };

  if (start instanceof Date && end instanceof Date) {
    whereClause.data = {
      [Op.between]: [start, end],
    };
  }

  const messages = await Message.findAll({
    where: whereClause,
    attributes: [
      'id',
      'tipo',
      'conteudo',
      'quem_enviou',
      'quem_recebeu',
      'data',
      'profile_whats_client',
    ],
    order: [['data', 'DESC']],
  });

  // Agrupar mensagens por 'quem_enviou' (número do cliente)
  const conversationsMap = new Map();

  for (const message of messages) {
    const contato = message.quem_enviou;
    if (!conversationsMap.has(contato)) {
      conversationsMap.set(contato, {
        contato: contato,
        messages: [],
      });
    }
    conversationsMap.get(contato).messages.push(message);
  }

  const conversations = Array.from(conversationsMap.values());

  return conversations;
}

export async function getUnprocessedOrders(start, end) {
  const whereClause = {
    tipo: 'sent',
    conteudo: {
      [Op.like]: '%Não consegui processar seu pedido%',
    },
  };

  if (start && end) {
    whereClause.data = {
      [Op.between]: [new Date(start), new Date(end)],
    };
  }

  const count = await Message.count({
    where: whereClause,
  });

  return count;
}

export async function getUnprocessedOrdersDetails(start, end) {
  const whereClause = {
    tipo: 'sent',
    conteudo: {
      [Op.like]: '%Não consegui processar seu pedido%',
    },
  };

  if (start instanceof Date && end instanceof Date) {
    whereClause.data = {
      [Op.between]: [start, end],
    };
  }

  const messages = await Message.findAll({
    where: whereClause,
    attributes: [
      'id',
      'tipo',
      'conteudo',
      'quem_enviou',
      'quem_recebeu',
      'data',
      'profile_whats_client',
      // Inclua outros campos necessários
    ],
    order: [['data', 'DESC']],
  });

  // Agrupar mensagens por contato
  const conversationsMap = new Map();

  for (const message of messages) {
    const contato = message.quem_recebeu; // 'quem_recebeu' porque o tipo é 'sent'
    if (!conversationsMap.has(contato)) {
      conversationsMap.set(contato, {
        contato: contato,
        messages: [],
      });
    }
    conversationsMap.get(contato).messages.push(message);
  }

  // Converter o Map em um Array
  const conversations = Array.from(conversationsMap.values());

  return conversations;
}
