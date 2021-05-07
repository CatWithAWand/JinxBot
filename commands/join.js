const { reply } = require(`../utils/reply`);
const { successEmbed } = require(`../utils/embeds`);
const voiceComprehension = require(`../speech/voiceComprehension`);


module.exports = {
  name: `join`,
  description: `Invite the bot to join your voice channel.`,
  options: [
  ],
  usage: `/join`,
  intentID: `146847057319884`,
  async execute(interaction) {
    const { Bot, Bot: { config } } = require(`../server`);
    const successEmbed1 = successEmbed();
    let member = {};
    switch (interaction.constructor.name) {
    case `Object`:
      await Bot.guilds.cache.get(interaction.guild_id).members.fetch(interaction.member.user.id)
        .then((mbr) => {
          return member = mbr;
        })
        .catch(console.error);
      break;
    case `Message`:
      member = interaction.member;
      break;
    default:
      return;
    }
    if (member.voice.channel) {
      if (Bot.voice.connections.find(connection => connection.channel.members.has(member.id))) {
        return reply(interaction, { type: 4, content: `I am already connected to your channel`, flags: 1 << 6 });
      }
      try {
        const voiceConnection = await member.voice.channel.join();
        voiceConnection.channel.members.forEach((mbr) => {
          voiceComprehension.initiate(voiceConnection, mbr.user, mbr.guild.id);
        });
        if (config.source_ephemeral) {
          return reply(interaction, { type: 4, content: `Connected to **${voiceConnection.channel.name}** successfully.`, flags: 1 << 6 });
        }
        successEmbed1.setDescription(`Connected to **${voiceConnection.channel.name}** successfully.`);
        return reply(interaction, { type: 4, embeds: [successEmbed1] });
      }
      catch (err) {
        console.error(err);
        return reply(interaction, { type: 4, content: `There was an error while trying to connect!`, flasgs: 1 << 6 });
      }
    }
    else {
      return reply(interaction, { type: 4, content: `Please connect to a voice channel first.`, flags: 1 << 6 });
    }
  },
};