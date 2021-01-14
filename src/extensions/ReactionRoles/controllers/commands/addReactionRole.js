const Discord = require("discord.js");
const dbh = require("../../../.common/structures/DataHandling/DatabaseHandler.js");

exports.help = {
  name: "addReactionRole",
  description: "Add a new reaction role",
  usage: `ban <@user> [reason]`,
  example: `ban @Wumpus#0001 spamming`,
};
exports.conf = {
  aliases: [],
  cooldown: 5,
  permissions: ["MANAGE_ROLES"], //Moderator or higher.
  arguments: [],
};

exports.run = async (client, message, args) => {
  let channel = message.channel;

  let messageID = await new Promise(async (resolve, reject) => {
    newCollector(
      resolve,
      message.channel,
      message.author,
      "What is the ID of the message"
    );
  });
  if (!messageID) return;

  let channelID = await new Promise(async (resolve, reject) => {
    newCollector(
      resolve,
      message.channel,
      message.author,
      "What channel is the message in?"
    );
  });
  if (!channelID) return;

  let reaction = await new Promise(async (resolve, reject) => {
    newCollector(
      resolve,
      message.channel,
      message.author,
      "What is the reaction you want to add?"
    );
  });
  if (!reaction) return;

  let role = await new Promise(async (resolve, reject) => {
    newCollector(
      resolve,
      message.channel,
      message.author,
      "What role do you want to give?"
    );
  });
  if (!role) return;

  let reactionRoles = { reaction: reaction, role: role };

  await dbh.reactionRoles.addReactionRole(
    client,
    message.guild.id,
    channelID,
    messageID,
    reactionRoles
  );
};

async function newCollector(resolve, channel, author, question) {
  //ignore the channel.sendEmbed(), it is an extension that I made.
  await channel.sendEmbed({
    color: 0xff9f01,
    description: question,
  });

  const filter = (m) => m.author === author;
  const channelCollector = await channel.createMessageCollector(filter, {
    time: 15000,
    max: 1,
  });

  channelCollector.on("collect", (m) => {
    resolve(m.content);
  });

  channelCollector.on("end", (collected) => {
    if (!collected.size) {
      sendTimeRanOut(channel);
      resolve(null);
    }
  });
}

function sendTimeRanOut(channel) {
  channel.sendEmbed({
    color: 0xff9f01,
    description: "Reaction Role canceled because you took too long to answer.",
  });
}
