const Discord = require("discord.js"),
  cooldowns = new Discord.Collection();
const db = require("quick.db");
const commandUsage = require("../utils/commandUsage.js");
const metrics = require("../index.js");

module.exports = async (client, message) => {
  if (!message.guild) return;
  if (message.content.startsWith(".key")) {
    message.delete();
    return halloweenCheck(message);
  }

  if (message.author.id === "302050872383242240") bumpCheck(message);

  let inviteLink = [
    "discord.gg",
    "discord.com/invite",
    "discordapp.com/invite",
  ];

  if (inviteLink.some((word) => message.content.toLowerCase().includes(word))) {
    let teamsChannel = db.get(`teams.${message.guild.id}`) || "None";
    if (message.channel.id === teamsChannel) return;
    if (message.member.hasPermission("ADMINISTRATOR")) return;
    message
      .delete()
      .then(
        message.channel.send(
          `**${message.author.username}** you cannot promote your server here! You can only promote it in the teams and projects channel __if it is related to a project__`
        )
      )
      .then((msg) => commandUsage.deleteMsg(msg));
  }

  let prefix = db.get(`prefix.${message.guild.id}`) || ".";

  moderateInstancedChannels(client, message);

  if (
    message.content.startsWith(`<@!${client.user.id}>`) &&
    message.content.length === 22
  ) {
    return message.channel.send(`My prefix is **${prefix}**`);
  }
  if (message.author.bot || message.author === client.user) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(" ");
  let msg = message.content.toLowerCase();
  let cmd = args.shift().toLowerCase();
  let sender = message.author;

  message.flags = [];
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1));
  }
  let commandFile =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!commandFile) return;

  if (!cooldowns.has(commandFile.help.name))
    cooldowns.set(commandFile.help.name, new Discord.Collection());

  const member = message.member,
    now = Date.now(),
    timestamps = cooldowns.get(commandFile.help.name),
    cooldownAmount = (commandFile.conf.cooldown || 3) * 1000;

  if (!timestamps.has(member.id)) {
    if (!client.config.owners.includes(message.author.id)) {
      timestamps.set(member.id, now);
    }
  } else {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      try {
        message.delete();
      } catch {
        console.log("ERROR IN DELETING MESSAGE --> message.js");
      }
      return message.channel
        .send(
          `You need to wait **${timeLeft.toFixed(
            1
          )}** seconds to use this command again!`
        )
        .then((msg) => commandUsage.deleteMsg(msg));
    }

    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
  }

  try {
    if (!commandFile) return;
    metrics.sendEvent("message_" + commandFile.help.name);
    commandFile.run(client, message, args);
  } catch (error) {
    console.log(error);
  }
};

function moderateInstancedChannels(client, message) {
  let instancedChannels = db.get(`instanced.${message.guild.id}`);
  let instancedChannel;
  if (Array.isArray(instancedChannels)) {
    instancedChannel = instancedChannels.find(
      (channel) => channel.newChannel === message.channel.id
    );
  }
  if (!instancedChannel) return;

  let moderationChannel = client.channels.resolve(
    instancedChannel.channelForModeration.id
  );

  if (!moderationChannel) return;
  let messageData =
    "`" +
    "Author:" +
    "` " +
    `<@${message.author.id}>` +
    "\n`" +
    "Message Content:" +
    "`" +
    ` ${message.content}` +
    "\n------------------------------------------";

  moderationChannel.send(messageData);
}

function bumpCheck(message) {
  const embed = message.embeds[0];
  if (!embed) return;
  if (!embed.image) return;
  if (
    embed.image.url === "https://disboard.org/images/bot-command-image-bump.png"
  ) {
    const description = embed.description;
    const openingSign = description.indexOf("<");
    const closingSign = description.indexOf(">");
    const userId = description.substring(openingSign + 2, closingSign);

    const user = message.guild.members.resolve(userId);

    const beans = getRandomBeans();

    const emote = getEmote(message.guild, beans.type);

    const userEmbed = new Discord.MessageEmbed()
      .setColor(0xff9f01)
      .setAuthor("You are the best!")
      .setDescription(
        `Thank you for bumping the server! Please take ${beans.value}  ${emote}`
      );

    db.add(`account.${userId}.${beans.type}`, beans.value);
    message.channel.send(userEmbed);
  }
}

function getRandomBeans() {
  const num = Math.random();

  if (num <= 0.31) return { type: "devBeans", value: 1 };
  else if (num < 0.61) return { type: "devBeans", value: 2 };
  else if (num < 0.92) return { type: "devBeans", value: 3 };
  else return { type: "goldenBeans", value: 1 };
}

function getEmote(guild, type) {
  type = type.substring(0, type.length - 1);
  type = type.charAt(0).toUpperCase() + type.slice(1);
  const emote = guild.emojis.cache.find((emoji) => emoji.name === type);

  return emote || type;
}

function halloweenCheck(message, args) {
  const answer = message.content.slice(1).trim().split(" ");

  const krisRoomRole = db.get(`halloween.kris-room.${message.guild.id}`);
  const kitchenRoomRole = db.get(`halloween.kitchen.${message.guild.id}`);
  const backyardRole = db.get(`halloween.backyard.${message.guild.id}`);
  const dogParkRole = db.get(`halloween.dog-park.${message.guild.id}`);
  const phoneRole = db.get(`halloween.phone.${message.guild.id}`);
  const devlaunchersHqRole = db.get(
    `halloween.devlaunchers-hq.${message.guild.id}`
  );
  const vaultRole = db.get(`halloween.vault.${message.guild.id}`);
  const conclusionRole = db.get(`halloween.conclusion.${message.guild.id}`);

  if (answer[1] === "code") {
    if (message.member.roles.cache.has(kitchenRoomRole)) return;
    message.member.roles.add(kitchenRoomRole);
    correct(message, answer);
  } else if (answer[1] === "footprints") {
    if (!message.member.roles.cache.has(kitchenRoomRole)) return;
    if (message.member.roles.cache.has(backyardRole)) return;
    message.member.roles.add(backyardRole);
    correct(message, answer);
  } else if (answer[1] === "dog" && answer[2] === "park") {
    if (!message.member.roles.cache.has(backyardRole)) return;
    if (message.member.roles.cache.has(dogParkRole)) return;
    message.member.roles.add(dogParkRole);
    correct(message, answer);
  } else if (answer[1] === "090") {
    if (!message.member.roles.cache.has(dogParkRole)) return;
    if (message.member.roles.cache.has(phoneRole)) return;
    message.member.roles.add(phoneRole);
    correct(message, answer);
  } else if (answer[1] === "7") {
    if (!message.member.roles.cache.has(phoneRole)) return;
    if (message.member.roles.cache.has(devlaunchersHqRole)) return;
    message.member.roles.add(devlaunchersHqRole);
    correct(message, answer);
  } else if (answer[1] === "pass123") {
    if (!message.member.roles.cache.has(devlaunchersHqRole)) return;
    if (message.member.roles.cache.has(vaultRole)) return;
    message.member.roles.add(vaultRole);
    correct(message, answer);
  } else if (
    answer[1] === "luffy" ||
    answer[1] === "lava" ||
    answer[1] === "red" ||
    (answer[1] === "lava" && answer[2] === "luffy")
  ) {
    if (!message.member.roles.cache.has(vaultRole)) return;
    if (message.member.roles.cache.has(conclusionRole)) return;
    message.member.roles.add(conclusionRole);
    correct(message, answer);
  } else incorrect(message, answer);

  function correct(message, answer) {
    message.author.send("*New Room Open*");
    const logChannelId = db.get(`halloween.log-channel.${message.guild.id}`);
    const logChannel = message.guild.channels.resolve(logChannelId);

    logChannel.send(
      `<@${message.author.id}> entered the room with the code ${answer[1]}`
    );
  }

  function incorrect(message, answer) {
    message.author.send(
      `**Wrong key**\nYou entered ${"`"}${answer.map((x) => `${x}`)} ${"`"}`
    );
  }
}
