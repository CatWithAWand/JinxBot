const { reply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `hows_things`,
  intentID: `260695135557041`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    let audio = ``;
    const response = config.intent_response.hows_things[Math.floor(Math.random() * config.intent_response.hows_things.length)].toString();
    if (interaction.constructor.name === `VoiceConnection`) {
      audio = await speechSynthesis.execute(response);
    }
    reply(interaction, { content: response, audio: audio });
  },
};