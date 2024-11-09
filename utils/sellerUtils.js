// sellerUtils.js

import fs from 'fs';

const cellphoneMapping = JSON.parse(fs.readFileSync('./data/cellphoneMapping.json', 'utf-8'));

export function getSellerPhone(vendedorId) {
  return cellphoneMapping[vendedorId];
}
