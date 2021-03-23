const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `hows_alacrity`,
	intentID: `476501910060788`,
	async execute(interaction) {
		let audio = ``;
		const response = config.intent_response.hows_alacrity[Math.floor(Math.random() * config.intent_response.hows_alacrity.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};