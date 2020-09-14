const Discord = require("discord.js");
const devlaunchersBot = require("./handler/ClientBuilder.js");
const client = new devlaunchersBot({ partials: ["MESSAGE", "REACTION"] });

require("./handler/module.js")(client);
require("./handler/Event.js")(client);

client.package = require("../package.json");
client.on("warn", console.warn);
client.on("error", console.error);
client.login(client.config.token);
