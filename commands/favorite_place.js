const { reply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `favorite_place`,
  intentID: `1176189709507692`,
  async execute(interaction) {
    const { Bot, Bot: { config } } = require(`../server`);

    const image = config.intent_response.favorite_place_image;
    const response = config.intent_response.favorite_place[Math.floor(Math.random() * config.intent_response.favorite_place.length)].toString();

    if (interaction.constructor.name === `VoiceConnection`) {

      const replyChannel = Bot.channels.cache.get(config.home_channel);
      const audio = await speechSynthesis.execute(response);
      reply(interaction, { audio: audio });
      return replyChannel.send(image);
    }
    reply(interaction, { content: `${response} \n ${image}` });
  },
};