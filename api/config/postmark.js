const postmark = require("postmark");
const dotenv = require("dotenv");
dotenv.config();

const serverClient = new postmark.ServerClient(process.env.SERVICE_KEY);

module.exports = serverClient;