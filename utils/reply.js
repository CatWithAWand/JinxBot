/* eslint-disable no-unused-vars */
const fs = require(`fs`);
const { CommandInteraction, Message, VoiceConnection } = require(`discord.js`);
const { default: axios } = require(`axios`);

const deleteAudioFile = (audioFile) => {
  if(/\/([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})\./i.test(audioFile)) {
    fs.unlink(audioFile, function(err) {
      if (err) {
        return console.error(err);
      }
    });
  }
};

/**
   * @param {CommandInteraction} interaction
   * @param {Object} options
   * @return {}
   */
const interactionReply = async (interaction, options) => {
  // if (!(options.content || options.embeds)) throw new Error(`Must specify interaction reply content or embed(s)`);
  const { Bot } = require(`../server`);
  if (options.dm) {
    interaction.reply({ ephemeral:true, content: `I have responded to your request in DMs.` })
      .catch((err) => { throw err; });
    return await Bot.users.fetch(interaction.member.user.id)
      .then((user) => { return user.send(options.content ?? options.embeds); })
      .catch((err) => { throw err; });
  }

  const param = (options.content) ? `content` : `embeds`;

  interaction.reply({
    data: {
      [param]: options?.[param],
      flags: options?.flags,
    } })
    .catch((err) => { throw err; });
};

const messageReply = (interaction, options) => {
  if (!(options.content || options.embeds)) throw new Error(`Must specify reply message content`);
  return interaction.reply((options.content) ? options.content : options.embeds);
};

const voiceReply = (interaction, options) => {
  if (!options.audio) throw new Error(`Must specify voice reply audio file`);
  const dispatcher = interaction.play(fs.createReadStream(options.audio, { type: `ogg/opus` }));
  dispatcher.on(`finish`, () => {
    dispatcher.destroy();
    deleteAudioFile(options.audio);
  });
};

module.exports = {
  // eslint-disable-next-line no-inline-comments
  reply: async (/** @type { CommandInteraction | Message | VoiceConnection} */ interaction = null, options = null) => {
    // if (!(interaction && options)) throw new Error(`Interaction or options are null or undefined`);

    const type = interaction.constructor.name;
    console.log(interaction.constructor.name);
    if (type === `CommandInteraction`) return await interactionReply(interaction, options);
    if (type === `Message`) return messageReply(interaction, options);
    return voiceReply(interaction, options);
  },
};