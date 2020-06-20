const AWS = require("aws-sdk");
const uuid = require("uuid4");
const { ObjectId } = require("bson");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const routes = async (fastify, options) => {
  const database = fastify.mongo.db("db");
  const collection = database.collection("post");

  fastify.get("/", async (request, reply) => {
    return { Hello: "World" };
  });

  fastify.post("/posts/create", (req, reply) => {
    if (!req.isMultipart()) {
      reply.code(400).send(new Error("Request is not multipart"));
      return { Error: "Not Multipart" };
    }
    let myFile = req.body.file[0].filename.split(".");
    const fileType = myFile[myFile.length - 1];

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid()}.${fileType}`,
      Body: req.body.file[0].data,
    };
    s3.upload(params, async (error, data) => {
      if (error) {
        reply.code(500).send(error);
      }
      const newPost = {
        _id: new ObjectId(),
        title: req.body.title,
        description: req.body.description,
        url: data.Location,
      };
      const post = await collection.insertOne(newPost);
      reply.code(200).send(post.ops[0]);
    });
  });

  fastify.get("/play/:id", async (req, reply) => {
    const id = req.params.id;
    console.log(id);
    const query = {
      _id: ObjectId.createFromHexString(id),
    };
    const post = await collection.findOne(query);
    const options = {
      url: post.url,
      title: post.title,
      description: post.description,
    };
    reply.view("index.ejs", options);
  });
};

module.exports = routes;
