const fs = require(`fs`);
const { interactionReply, successEmbed, errorEmbed, infoEmbed, reloadCfg } = require(`../helper.js`);

module.exports = {
	name: `rate`,
	description: `Set, get, or reset the speech rate value.`,
	options: [
		{
			type: 1,
			name: `set`,
			description: `Set a new rate value.`,
			options: [
				{
					type: 4,
					name: `value`,
					description: `Range: -100 - +200`,
					default: false,
					required: true,
				},
			],
		},
		{
			type: 1,
			name: `get`,
			description: `Get the current rate value.`,
			options: [],
		},
		{
			type: 1,
			name: `reset`,
			description: `Reset the rate value to its default (0).`,
			options: [],
		},
	],
	usage: `/rate set value: -8`,
	async execute(interaction) {
		const { Bot: { config } } = require(`../server.js`);
		const successEmbed1 = successEmbed();
		const errorEmbed1 = errorEmbed();
		const infoEmbed1 = infoEmbed();

		if (!config.moderators.includes(`${interaction.member.user.id}`)) {
			return interactionReply(interaction, { type: 4, content: `You cannot execute this command! It's only for my moderators.`, flags: 1 << 6 });
		}
		if (interaction.data.options[0].name === `set`) {
			const value = interaction.data.options[0].options[0].value;
			if (value < -100 || value > 200) {
				errorEmbed1.setDescription(`The value you specified of **${value}** exceeds the acceptable range. (-100 - +200)`);
				return interactionReply(interaction, { type: 4, embeds: errorEmbed1 });
			}
			let embed = null;
			try {
				const data = JSON.parse(fs.readFileSync(`config.json`));
				const prev_value = data.speech_rate;
				const new_value = (value > 0) ? `+${value}` : `${value}`;
				data.speech_rate = new_value;
				fs.writeFileSync(`config.json`, JSON.stringify(data, null, 4));
				reloadCfg();
				embed = successEmbed1.setDescription(`Successfully changed speech rate value from **${prev_value}** to **${new_value}**.`);
			}
			catch (err) {
				console.error(err);
				embed = errorEmbed1.setDescription(`Encountered an error while trying to update **config**!`);
			}
			return interactionReply(interaction, { type: 4, embeds: embed });
		}
		else if (interaction.data.options[0].name === `get`) {
			infoEmbed1.setDescription(`Current speech rate value: **${config.speech_rate}**`);
			return interactionReply(interaction, { type: 4, embeds: infoEmbed1 });
		}
		else {
			let embed = null;
			try {
				const data = JSON.parse(fs.readFileSync(`config.json`));
				data.speech_rate = `0`;
				fs.writeFileSync(`config.json`, JSON.stringify(data, null, 4));
				reloadCfg();
				embed = successEmbed1.setDescription(`Successfully reset speech rate value to **0**.`);
			}
			catch (err) {
				console.error(err);
				embed = errorEmbed1.setDescription(`Encountered an error while trying to update **config**!`);
			}
			return interactionReply(interaction, { type: 4, embeds: embed });
		}
	},
};