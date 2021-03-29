const { interactionReply } = require(`../helper.js`);

module.exports = {
	name: `test`,
	description: `Test slash command.`,
	options: [
	],
	usage: `/test`,
	devOnly: true,
	async execute(interaction) {
		const { Bot } = require(`../server.js`);
		let temp = ``;
		Bot.commands.forEach((command) => {
			if (command.options) {
				temp += command.name;
			}
		});
		interactionReply(interaction, { type: 4, content: temp });
	},
};