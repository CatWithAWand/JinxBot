const { interactionReply, infoEmbed } = require(`../helper.js`);

module.exports = {
	name: `quota`,
	description: `Displays the current Speech Services quota limit.`,
	options: [
	],
	usage: `/quota`,
	async execute(interaction) {
		const { Bot: { config } } = require(`../server.js`);
		const infoEmbed1 = infoEmbed();

		infoEmbed1.setDescription(`Speech quota usage: ${config.speech_quota_usage}/450000 (characters)`);
		return interactionReply(interaction, { type: 4, embeds: infoEmbed1 });
	},
};