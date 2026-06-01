const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'index.html');
let text = fs.readFileSync(file, 'utf8');
const regex = /<div id="product-list"><\/div>\s*<div class="content" id="products">[\s\S]*?<section class="dual-gradient-bg">/;
const replacement = '<div class="content" id="products">\n  <div id="product-list" class="product-grid"></div>\n  </div>\n  <section class="dual-gradient-bg">';
if (!regex.test(text)) {
  console.error('NOT_FOUND');
  process.exit(1);
}
text = text.replace(regex, replacement);
fs.writeFileSync(file, text, 'utf8');
console.log('patched');
