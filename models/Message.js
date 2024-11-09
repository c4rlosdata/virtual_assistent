// models/Message.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/index.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.ENUM('sent', 'received'),
    allowNull: false,
  },
  conteudo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  quem_enviou: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quem_recebeu: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  profile_whats_client: { // Adicionando a nova coluna
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  tableName: 'mensagens',
  timestamps: false,
});

export default Message;
