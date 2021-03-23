const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `alacrity_bad`,
	intentID: `1174092659709739`,
	async execute(interaction) {
		let audio = ``;
		const response = config.intent_response.alacrity_bad[Math.floor(Math.random() * config.intent_response.alacrity_bad.length)].toString();
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};