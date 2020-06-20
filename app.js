const fastify = require("fastify")({ logger: true });
const path = require('path')

require("dotenv").config();

fastify.register(require("point-of-view"), {
  engine: {
    ejs: require("ejs"),
  },
  root: path.join(__dirname, 'view'),
});

fastify.register(require("fastify-multipart"), { addToBody: true });

fastify.register(require("./database/connection"), {
  url: process.env.DATABASE_URL,
  useUnifiedTopology: true,
});

fastify.register(require("./routes/routes"));

fastify.listen(3000, (err, address) => {
  if (err) {
    fastify.log.error(err);
  }
});
