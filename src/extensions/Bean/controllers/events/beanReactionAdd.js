const Discord = require("discord.js");
const DatabaseHandler = require("./../../../.common/structures/DataHandling/DatabaseHandler.js");
const ms = require("parse-ms");
const metrics = require("../../../../index.js");

exports.eventHandle = "messageReactionAdd";
exports.event = async (client, messageReaction, user) => {
  metrics.sendEvent("message_reaction_add");

  if (messageReaction.isBeanReaction()) {
    let message = messageReaction.message;
    let msgAuthor = message.author.id;
    let msgReactor = user.id;

    if (msgAuthor === msgReactor) return;
    if (msgAuthor.bot || msgReactor.bot) return;

    let cooldown = 60000; //1 Minute
    let padZero = (num) => (num < 10 ? "0" : "") + num; //Appends a 0 if num is less than 10. 9 --> 09

    let dbh = new DatabaseHandler(message.guild.id);
    let reactorLastDevBean = dbh.beans.getUserLastDevBeanGiven(msgReactor);
    console.log(reactorLastDevBean)

    try {
      if (reactorLastDevBean !== null && cooldown - (Date.now() - reactorLastDevBean) > 0) {
        timeObj = ms(cooldown - (Date.now() - reactorLastDevBean));
        let seconds = padZero(timeObj.seconds).padStart(2, "");
        let finalTime = `**${seconds} second(s)**`;
        message.removeReaction(message.reactions, user,"DevBean");
        user.send(`You need to wait ${finalTime} `);
      } else {
        dbh.beans.addUserDevBeans(msgAuthor);
        dbh.beans.setUserLastDevBeanGiven(msgReactor);
        user.sendEmbed({
          color: 0xff9f01,
          description: `1 Dev Bean has been given to **${message.author.tag}**`
        });
      }
    } catch (error) {
      console.log(error);
      user.sendEmbed({color: "RED", description: "There was an error!"});
    }
  }
};
/*async function awardDevBean(client, messageReaction, user) {
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
      await removeEmoji(messageReaction, user);
      return user.send(`You need to wait ${finalTime} `);
    } else {
      db.set(`lastDevBean.${user.id}`, Date.now());
      db.add(`account.${userToGiveBeansTo}.devBeans`, 1);
      db.add(`account.${userToGiveBeansTo}.foreverDevBeans`, 1);
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
}*/
