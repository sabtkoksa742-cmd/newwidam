const fs = require('fs');
const text = fs.readFileSync('index.html','utf8');
const count = (text.match(/class="product-card"/g) || []).length;
console.log(count);
