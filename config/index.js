import dotenv from 'dotenv';
dotenv.config();

export const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
export const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
export const MERCOS_APPLICATION_TOKEN = process.env.MERCOS_APPLICATION_TOKEN;
export const MERCOS_COMPANY_TOKEN = process.env.MERCOS_COMPANY_TOKEN;
export const MERCOS_COMPANY_TOKEN_DSSO = process.env.MERCOS_COMPANY_TOKEN_DSSO;
export const MERCOS_LOGIN_EMAIL = process.env.MERCOS_LOGIN_EMAIL;
export const MERCOS_LOGIN_PASSWORD = process.env.MERCOS_LOGIN_PASSWORD;



import { Sequelize } from 'sequelize';

// Utilize a variável de ambiente DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Ajuste conforme necessário
    }
  },
  logging: false, // Desative logs do Sequelize se preferir
});

export default sequelize;