const { reply } = require(`../utils/reply`);
const { successEmbed } = require(`../utils/embeds`);
const { joinVoiceChannel } = require(`@discordjs/voice`);
const voiceComprehension = require(`../speech/voiceComprehension`);
const { Message } = require(`discord.js`);


module.exports = {
  name: `join`,
  description: `Invite the bot to join your voice channel.`,
  options: [
  ],
  usage: `/join`,
  intentID: `146847057319884`,
  /**
   *
   * @param {Message} interaction
   * @returns {}
   */
  async execute(interaction) {
    const { Bot, Bot: { config } } = require(`../server`);
    const successEmbed1 = successEmbed();
    const member = interaction.member;
    // switch (interaction.constructor.name) {
    // case `Object`:
    //   await Bot.guilds.cache.get(interaction.guild_id).members.fetch(interaction.member.user.id)
    //     .then((mbr) => {
    //       return member = mbr;
    //     })
    //     .catch(console.error);
    //   break;
    // case `Message`:
    //   member = interaction.member;
    //   break;
    // default:
    //   return;
    // }
    if (member.voice.channel) {
      if (interaction.guild.me.voice?.channel?.members.has(member.id)) {
        return reply(interaction, { content: `I am already connected to your channel`, ephemeral: true });
      }
      try {
        // const voiceConnection = await member.voice.channel.
        // voiceConnection.channel.members.forEach((mbr) => {
        //   voiceComprehension.initiate(voiceConnection, mbr.user, mbr.guild.id);
        // });
        const voiceConnection = await joinVoiceChannel({
          channelId: member.voice.channelId,
          guildId: member.guild.id,
          adapterCreator: member.guild.voiceAdapterCreator,
        });
        if (config.source_ephemeral) {
          return reply(interaction, { content: `Connected to **${voiceConnection.channel.name}** successfully.`, ephemeral: true });
        }
        successEmbed1.setDescription(`Connected to **${voiceConnection.channel.name}** successfully.`);
        return reply(interaction, { embeds: [successEmbed1] });
      }
      catch (err) {
        console.error(err);
        return reply(interaction, { content: `There was an error while trying to connect!`, ephemeral: true });
      }
    }
    else {
      return reply(interaction, { content: `Please connect to a voice channel first.`, ephemeral: true });
    }
  },
};