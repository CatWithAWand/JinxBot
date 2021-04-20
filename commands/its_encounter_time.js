const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);

module.exports = {
	name: `its_encounter_time`,
	intentID: `765089154109854`,
	async execute(interaction, data) {
		const { Bot: { config } } = require(`../server.js`);
		let audio = ``;
		let response = ``;
		if (data.entities[`boss:boss`]?.[0]?.value === `Sabir`) {
			response = config.intent_response.its_encounter_time.sabir[Math.floor(Math.random() * config.intent_response.its_encounter_time.sabir.length)].toString();
		}
		else if (data.entities[`boss:boss`]?.[0]?.value === `Adina`) {
			response = config.intent_response.its_encounter_time.adina[Math.floor(Math.random() * config.intent_response.its_encounter_time.adina.length)].toString();
		}
		else {
			return;
		}
		if (interaction.constructor.name === `VoiceConnection`) {
			audio = await speechSynthesis.execute(response);
		}
		interactionReply(interaction, { content: response, audio: audio });
	},
};