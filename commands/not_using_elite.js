const { reply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `not_using_elite`,
  intentID: `884771695694863`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    let audio = ``;
    const response = config.intent_response.not_using_elite[Math.floor(Math.random() * config.intent_response.not_using_elite.length)].toString();
    if (interaction.constructor.name === `VoiceConnection`) {
      audio = await speechSynthesis.execute(response);
    }
    reply(interaction, { content: response, audio: audio });
  },
};