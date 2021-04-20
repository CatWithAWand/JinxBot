const { interactionReply } = require(`../helper.js`);

module.exports = {
	name: `test`,
	description: `Test slash command.`,
	options: [
	],
	usage: `/test`,
	devOnly: true,
	async execute(interaction) {
		const { Bot: { config } } = require(`../server.js`);
		return interactionReply(interaction, { type: 4, content: config.wake_word });
	},
};