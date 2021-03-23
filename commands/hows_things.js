const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `hows_things`,
	intentID: `260695135557041`,
	async execute(interaction) {
		let audio = ``;
		const response = config.intent_response.hows_things[Math.floor(Math.random() * config.intent_response.hows_things.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};