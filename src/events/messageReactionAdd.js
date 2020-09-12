const Discord = require("discord.js");
const db = require("quick.db");
const ms = require("parse-ms");

async function fetchMessage(client, messageReaction, user) {
  if (messageReaction.message.partial) {
    return await messageReaction.fetch();
  } else return messageReaction;
}

async function removeEmoji(messageReaction, user) {
  const userReactions = messageReaction.message.reactions.cache.filter(
    (reaction) => reaction.users.cache.has(user.id)
  );
  try {
    for (const reaction of userReactions.values()) {
      await reaction.users.remove(user.id);
    }
  } catch (error) {
    console("Failed to remove reactions.");
  }
}

module.exports = async (client, messageReaction, user) => {
  if (messageReaction.emoji.name === "DevBean") {
    let message = await fetchMessage(client, messageReaction, user);
    return awardDevBean(client, message, user);
  }
  if (messageReaction.emoji.name === "GoldenBean") {
    let message = await fetchMessage(client, messageReaction, user);
    return awardGoldenBean(client, message, user);
  }
  if (messageReaction.emoji.name === "✔️") {
    let message = await fetchMessage(client, messageReaction, user);
    return instancedChannelAddRole(client, message, user);
  }
};

function awardDevBean(client, messageReaction, user) {
  let userToGiveBeansTo = messageReaction.message.author.id; //id of the users whos message got a reaction
  let userWhoReacted = user.id; //user that reacted
  //if there were any bots involved in the message we do not want to continue
  let cooldown = 60000;
  let pad_zero = (num) => (num < 10 ? "0" : "") + num; //do not ask me what this does
  let timeObj;
  let lastDevBean = db.get(`lastDevBean.${user.id}`);
  if (user.bot || messageReaction.message.author.bot) return;
  //if the user reaction to his own message he will not get a devBean
  if (userToGiveBeansTo === userWhoReacted) return;
  try {
    if (lastDevBean !== null && cooldown - (Date.now() - lastDevBean) > 0) {
      timeObj = ms(cooldown - (Date.now() - lastDevBean));
      let seconds = pad_zero(timeObj.seconds).padStart(2, "");
      let finalTime = `**${seconds} second(s)**`;
      removeEmoji(messageReaction, user);
      return user.send(`You need to wait ${finalTime} `);
    } else {
      db.set(`lastDevBean.${user.id}`, Date.now());
      db.add(`account.${userToGiveBeansTo}.devBeans`, 1);
      user.send(
        `Dev Bean added to **${messageReaction.message.author.tag}** balance!`
      );
    }
  } catch (err) {
    console.log(err);
    user.send(
      "Oopsie, for some reason I could not award the user with the dev-bean"
    );
  }
}

function awardGoldenBean(client, messageReaction, user) {
  //if there were any bots involved in the message we do not want to continue
  if (user.bot || messageReaction.message.author.bot) return;
  //if the user does not react with the correct emoji, we do not want to do anything
  if (messageReaction.emoji.name !== "GoldenBean") return;
  //if the user is not an admininstrator, we do not want to award the user with a golden bean
  let userToGiveGoldenBeansTo = messageReaction.message.author.id; //id of the users whos message got a reaction
  let userWhoReacted = user.id; //user that reacted
  let cooldown = 8.64e7;
  let pad_zero = (num) => (num < 10 ? "0" : "") + num; //do not ask me what this does
  //if the user reaction to his own message he will not get a devBean
  if (userToGiveGoldenBeansTo === userWhoReacted) return;
  let lastGoldenBean = db.get(`lastGoldenBean.${user.id}`);
  let timeObj;
  try {
    if (
      lastGoldenBean !== null &&
      cooldown - (Date.now() - lastGoldenBean) > 0
    ) {
      timeObj = ms(cooldown - (Date.now() - lastGoldenBean));
      let hours = pad_zero(timeObj.hours).padStart(2, "0"),
        minutes = pad_zero(timeObj.minutes).padStart(2, "");
      let finalTime = `**${hours} hour(s) and ${minutes} minute(s)**`;
      removeEmoji(messageReaction, user);
      return user.send(`You need to wait ${finalTime} `);
    } else {
      db.set(`lastGoldenBean.${user.id}`, Date.now());
      db.add(`account.${userToGiveGoldenBeansTo}.goldenBeans`, 1);
      user.send(
        `Golden Bean added to **${messageReaction.message.author.tag}** balance!`
      );

      return db.set(
        `lastGoldenBeanAwarded.${user.id}`,
        messageReaction.message.id
      );
    }
  } catch (err) {
    //if there is an error, send an "error" message
    user.send(
      "Oopsie, for some reason I could not award the user with the golden-bean"
    );
    console.log(err);
  }
}

function instancedChannelAddRole(client, messageReaction, user) {
  let channelsCreated = db.get(`instanced.${messageReaction.message.guild.id}`);
  if (!channelsCreated) return;
  if (user.bot) return;
  if (channelsCreated.length === 0) return;
  const messageRole = channelsCreated.find((channel) =>
    channel.id.includes(messageReaction.message.id)
  );
  if (!messageRole) return;
  const isUserBlacklisted = messageRole.blacklist.find(
    (blacklisted) => blacklisted === user.id
  );
  if (isUserBlacklisted) {
    return messageReaction.message.channel
      .send(
        "`" + user.username + "`" + " you are blacklisted from this channel"
      )
      .then((m) => m.delete({ timeout: 10000 }));
  }

  const isRoleActive = messageReaction.message.guild.roles.cache.find(
    (role) => role.id === messageRole.role
  );
  if (!isRoleActive) {
    return messageReaction.message.channel
      .send("`" + user.username + "`" + " that channel does not exist anymore")
      .then((m) => m.delete({ timeout: 10000 }));
  }
  if (
    messageReaction.message.guild.members.cache
      .get(user.id)
      .roles.cache.some((role) => role.id === messageRole.role)
  )
    return;

  let channel = client.channels.cache.get(messageRole.newChannel);
  messageReaction.message.guild.members.cache
    .get(user.id)
    .roles.add(messageRole.role)
    .then(
      channel.send("`" + `${user.username}` + "`" + " joined the channel!")
    );
}
