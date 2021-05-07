/* eslint-disable no-unused-vars */
const fs = require(`fs`);
const { APIMessage, Message, VoiceConnection } = require(`discord.js`);
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

const interactionReply = async (interaction, options) => {
  // if (!(options.content || options.embeds)) throw new Error(`Must specify interaction reply content or embed(s)`);

  const { Bot } = require(`../server`);
  if (options.dm) {
    Bot.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: `I have responded to your request in DMs.`,
          flags: 1 << 6,
        },
      },
    })
      .catch((err) => { throw err; });
    return await Bot.users.fetch(interaction.member.user.id)
      .then((user) => { return user.send(options.content ?? options.embeds); })
      .catch((err) => { throw err; });
  }

  const param = (options.content) ? `content` : `embeds`;

  if (options.update) {
    return await axios.patch(`https://discord.com/api/v8/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
      [param]: options?.[param],
    })
      .catch(console.error);
  }

  return await Bot.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
      type: options.type ?? 4,
      data: {
        [param]: options?.[param],
        flags: options?.flags,
      },
    },
  })
    .catch((err) => { throw err; });
};

const messageReply = (interaction, options) => {
  if (!(options.content || options.embeds)) throw new Error(`Must specify reply message content`);
  interaction.channel.stopTyping(true);
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
  reply: async (/** @type { APIMessage | Message | VoiceConnection} */ interaction = null, options = null) => {
    // if (!(interaction && options)) throw new Error(`Interaction or options are null or undefined`);

    const type = interaction.constructor.name;
    if (type === `Object`) return await interactionReply(interaction, options);
    if (type === `Message`) return messageReply(interaction, options);
    return voiceReply(interaction, options);
  },
};