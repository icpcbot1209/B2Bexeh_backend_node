const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port);
console.log(`Backend loaded on http://localhost:${port}`);
