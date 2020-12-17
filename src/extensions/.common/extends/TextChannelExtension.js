const Discord = require("discord.js");
const { Structures } = require("discord.js");

Structures.extend("TextChannel", (TextChannel) => {
  class TextChannelExtension extends TextChannel {
    constructor(guild, data) {
      super(guild, data);
    }

    sendEmbed(args) {
      const embed = new Discord.MessageEmbed();
      if (args.color) embed.setColor(args.color);
      if (args.author) embed.setAuthor(args.author);
      if (args.title) embed.setTitle(args.title);
      if (args.description) embed.setDescription(args.description);
      if (args.footer) embed.setFooter(args.footer);
      if (args.timestamp) embed.setTimestamp(args.timestamp);

      return this.send(embed);
    }

    sendPoll(args) {
      return this.sendEmbed({
        title: "📝 " + "**" + args.subject + "**",
        description: "Poll initated by " + args.author,
        color: 0xff9f01,
      }).then((msgReaction) => {
        msgReaction.react("👍");
        msgReaction.react("👎");
      });
    }
  }

  return TextChannelExtension;
});
