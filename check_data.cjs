const d = require('./src/data/raw_hiv_dataset.json');
console.log('Records:', d.length);
console.log('Fields:', Object.keys(d[0]).join(', '));
console.log('Sample:', JSON.stringify(d[0], null, 2));
const statuses = {};
d.forEach(r => { statuses[r.status_odhiv] = (statuses[r.status_odhiv] || 0) + 1; });
console.log('Status distribution:', statuses);
