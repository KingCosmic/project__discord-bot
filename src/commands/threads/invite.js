const Discord = require("discord.js");
const db = require("quick.db");

exports.run = async (client, message, args) => {
  let channelsCreated = await db.get(`instanced.${message.guild.id}`);
  if (!channelsCreated || !Array.isArray(channelsCreated)) {
    return message.channel.send(
      "`" + message.author.username + "`" + ", this channel is not a thread! "
    );
  }
  let channelToInviteUserTo;
  channelToInviteUserTo = message.mentions.channels.first();
  if (!channelToInviteUserTo) {
    return message.channel.send(
      "`" + message.author.username + "`" + "  you need to specify a channel!"
    );
  }
  let channelIn = channelsCreated.find(
    (channel) => channel.newChannel === channelToInviteUserTo.id
  );
  if (!channelIn) {
    return message.channel.send(
      "`" + message.author.username + "`" + ", this channel is not a thread!"
    );
  }
  let index = channelsCreated.indexOf(channelIn);
  const embed = new Discord.MessageEmbed()
    .setAuthor(`🧵 Invite to the "${channelToInviteUserTo.name}" thread`)
    .setDescription(
      `Accept the invite and join the "${channelToInviteUserTo.name}" thread by reacting to this message!`
    )
    .setFooter("| Dev Launchers Threads", message.guild.iconURL())
    .setColor(0xff9f01);

  await message.channel.send(embed).then((msg) => {
    msg.react("✔️");
    channelIn.id.push(msg.id);
  });
  channelsCreated.splice(index, 1, channelIn);
  db.set(`instanced.${message.guild.id}`, channelsCreated);
};

exports.help = {
  name: "invite",
  description: "Creates an invite to a thread",
  usage: "invite <#channel>",
  example: "invite #secret-chat",
};

exports.conf = {
  aliases: [],
  cooldowns: 10,
};
