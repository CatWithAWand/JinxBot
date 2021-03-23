const { interactionReply } = require(`../helper.js`);
const speechSynthesis = require(`../speech/speechSynthesis.js`);
const config = require(`../config.json`);

module.exports = {
	name: `encounter_do`,
	intentID: `455020982579355`,
	async execute(interaction, data) {
		const { Bot } = require(`../server.js`);
		let video = ``;
		let response = ``;

		if (data.entities[`boss:boss`][0].value === `Sabir`) {
			video = config.intent_response.sabir_video;
			response = config.intent_response.encounter_do.sabir[Math.floor(Math.random() * config.intent_response.encounter_do.sabir.length)].toString();
		}
		else if (data.entities[`boss:boss`][0].value === `Adina`) {
			video = config.intent_response.adina_video;
			response = config.intent_response.encounter_do.adina[Math.floor(Math.random() * config.intent_response.encounter_do.adina.length)].toString();
		}
		else {
			return;
		}

		if (interaction.constructor.name === `VoiceConnection`) {
			const replyChannel = await Bot.channels.fetch(config.home_channel);
			const audio = await speechSynthesis.execute(response);
			interactionReply(interaction, { audio: audio });
			return replyChannel.send(video);
		}
		interactionReply(interaction, { content: `${response} \n ${video}` });
	},
};