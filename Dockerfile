# Use uma imagem base oficial do Node.js
FROM node:18

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie os arquivos package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta em que sua aplicação rodará
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["node", "app.js"]
