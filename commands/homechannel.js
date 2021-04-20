const importFresh = require(`import-fresh`);
const fs = require(`fs`);
const { interactionReply, successEmbed, errorEmbed, infoEmbed, reloadCfg } = require(`../helper.js`);

module.exports = {
	name: `homechannel`,
	description: `Set or get the bot's home channel.`,
	options: [
		{
			type: 1,
			name: `set`,
			description: `Set a new home channel.`,
			options: [
				{
					type: 7,
					name: `channel`,
					description: `Bot's new home channel.`,
					default: false,
					required: true,
				},
			],
		},
		{
			type: 1,
			name: `get`,
			description: `Get the current home channel.`,
			options: [],
		},
	],
	usage: `/homechannel set channel: #mybotschannel`,
	async execute(interaction) {
		const { Bot, Bot: { config } } = require(`../server.js`);
		const successEmbed1 = successEmbed();
		const infoEmbed1 = infoEmbed();
		const errorEmbed1 = errorEmbed();

		if (!config.moderators.includes(`${interaction.member.user.id}`)) {
			return interactionReply(interaction, { type: 4, content: `You cannot execute this command! It's only for my moderators.`, flags: 1 << 6 });
		}
		const channelID = (interaction.data.options[0].name === `set`) ? interaction.data.options[0].options[0].value : config.home_channel;
		let channel = null;
		await Bot.channels.fetch(channelID)
			.then((chnl) => channel = chnl)
			.catch(console.error);
		if (interaction.data.options[0].name === `set`) {
			let embed = null;
			try {
				const data = JSON.parse(fs.readFileSync(`config.json`));
				data.home_channel = channel.id;
				fs.writeFileSync(`config.json`, JSON.stringify(data, null, 4));
				reloadCfg();
				embed = successEmbed1.setDescription(`Successfully set **${channel.name}** as new home channel.`);
			}
			catch (err) {
				console.error(err);
				embed = errorEmbed1.setDescription(`Encountered an error while trying to update **config**!`);
			}
			return interactionReply(interaction, { type: 4, embeds: embed });
		}
		else {
			infoEmbed1.setDescription(`Current home channel: **${channel.name}**`);
			return interactionReply(interaction, { type: 4, embeds: infoEmbed1 });
		}
	},
};