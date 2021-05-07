const Discord = require(`discord.js`);

module.exports = {
  rolecolorEmbed: (guildID) => {
    const { Bot } = require(`../server`);
    const color = Bot.guilds.cache.get(guildID).members.cache.get(Bot.user.id).displayHexColor ?? `#2196f3`;
    return new Discord.MessageEmbed()
      .setColor(color)
      .setThumbnail();
  },
  colorEmbed: (color) => {
    return new Discord.MessageEmbed()
      .setColor(color)
      .setThumbnail();
  },
  infoEmbed: () => {
    return new Discord.MessageEmbed()
      .setAuthor(`Information.`, `https://cdn.discordapp.com/attachments/815578278025756702/815578739026952202/information.png`)
      .setColor(`#2196f3`)
      .setThumbnail();
  },
  successEmbed: () => {
    return new Discord.MessageEmbed()
      .setAuthor(`Success!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578768919101468/success.png`)
      .setColor(`#4caf50`)
      .setThumbnail();
  },
  warningEmbed: () => {
    return new Discord.MessageEmbed()
      .setAuthor(`Warning!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578795653464114/warning.png`)
      .setColor(`#ff9800`)
      .setThumbnail();
  },
  errorEmbed: () => {
    return new Discord.MessageEmbed()
      .setAuthor(`Error!`, `https://cdn.discordapp.com/attachments/815578278025756702/815578828738265138/error.png`)
      .setColor(`#f44336`)
      .setThumbnail();
  },
  redditEmbed: ({ title, score, comments_num, post_link, uploaded_UTC, subreddit_name_prefixed, image, author }) => {
    return new Discord.MessageEmbed()
      .setTitle(title)
      .setDescription(`${score} <:redditupvote:839935591964999690> | ${comments_num} <:comment:839943322830503966>`)
      .setURL(post_link)
      .setTimestamp(new Date(uploaded_UTC).toISOString())
      .setFooter(subreddit_name_prefixed)
      .setImage(image)
      .setAuthor(author, `https://cdn.discordapp.com/attachments/815578278025756702/839938482477465670/reddit_icon.png`)
      .setColor(`#f14503`);
  },
};