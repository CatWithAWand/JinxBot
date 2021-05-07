const { reply } = require(`../utils/reply`);
const speechSynthesis = require(`../speech/speechSynthesis`);

module.exports = {
  name: `drop_from_team`,
  intentID: `243426257493177`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    let audio = ``;
    const response = config.intent_response.drop_from_team[Math.floor(Math.random() * config.intent_response.drop_from_team.length)].toString();
    if (interaction.constructor.name === `VoiceConnection`) {
      audio = await speechSynthesis.execute(response);
    }
    reply(interaction, { content: response, audio: audio });
  },
};