const app = require("./app");
const config = require("./app/config/config.js").get(process.env.NODE_ENV);

var port = process.env.PORT || config.port;

app.listen(port).timeout = 1800000; //30 min
console.log(`loaded on http://localhost:${port}`);
