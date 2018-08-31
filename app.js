const express = require('express');
const app = express();
const routes = require('../viven-health/server/routes/routes');
const path = require('path');

app.use(routes);

/*app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/viven-health/index.html'));
});*/

app.listen(3000);