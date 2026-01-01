import { httpServerHandler } from 'cloudflare:node';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Express.js running on Cloudflare Workers!' });
});

app.get('/api/users/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'User ' + req.params.id
  });
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });
// Or you can simply pass the http.Server instance directly:
// export default httpServerHandler(app.listen(3000));