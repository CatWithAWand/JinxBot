const fs = require(`fs`);
const Discord = require(`discord.js`);
const config = require(`./config.json`);
const Schedule = require(`node-schedule`);
const { Wit, log } = require(`node-wit`);
const { interactionReply, errorEmbed } = require(`./helper.js`);

// Discord bot
const myIntents = new Discord.Intents();
myIntents.add(Discord.Intents.ALL);
const Bot = new Discord.Client({ intents: myIntents, ws: { intents: myIntents } });

// WitAI
const WitAI = new Wit({
	accessToken: config.witai_token,
	logger: new log.Logger(log.DEBUG),
});

// Other constants
const activities = config.activities;

// Load commands
Bot.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(`.js`));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	Bot.commands.set(command.name, command);
}

// Schedule jobs
// eslint-disable-next-line no-unused-vars
const botActivity = Schedule.scheduleJob(`*/10 * * * *`, function() {
	Bot.user.setPresence({ status: `online`, activity: { name: activities[Math.floor(Math.random() * activities.length)].toString() } });
});

// On bot ready listener
Bot.once(`ready`, async () => {
	Bot.user.setPresence({ status: `online`, activity: { name: `it's Alacrity time` } });
	console.log(`Bot is online!`);
});

// On guild join listener
Bot.on(`guildCreate`, async (guild) => {
	// Set custom server nickname
	const botMember = (await guild.members.fetch()).filter(member => member.id === `820729352793620520`).first();
	botMember.setNickname(`[TLS]⛧Jinx ⛧`);
	// Find first text channel with SEND_MESSAGES permission for @everyone
	const firstChannel = guild.channels.cache.filter(channel => channel.type === `text` && channel.permissionsFor(guild.roles.everyone.id).has(`SEND_MESSAGES`) === true).find(c => c.position === 0);
	const error = new Discord.Collection();
	const errorEmbed1 = errorEmbed();
	errorEmbed1.setDescription(`Hey, I joined but I could not register the following slash commands. Anyway where's TutminatorT92?`);
	let counter = 0;
	// Promise due to the codes asynchronous nature
	// eslint-disable-next-line no-unused-vars
	const promise = new Promise((resolve, reject) => {
		Bot.commands.forEach((command) => {
			if (command.options) {
				Bot.api.applications(Bot.user.id).guilds(guild.id).commands.post({ data: {
					name: command.name,
					description: command.description,
					options: command.options,
				} })
					.catch((err) => {
						error.set(command.name, { name: command.name, error: err.message, code: err.code.toString() });
						// console.error(err);
					})
					.finally(() => {
						counter++;
						if (counter == Bot.commands.size) {
							resolve();
						}
					});
			}
		});
	});
	promise.catch((err) => {
		console.error(err);
	});
	promise.then(() => {
		if (!(error.size === 0)) {
			error.forEach((command) => {
				errorEmbed1.addField(command.name, `Error: ${command.error}, Code: ${command.code}`, false);
			});
			return firstChannel.send(errorEmbed1);
		}
		firstChannel.send(`Hey, it's me Jinx, I'm looking for TutminatorT92.`);
	});
});


// On message listener
Bot.on(`message`, async (message) => {
	try {
		// Exit if the author is the bot or the bot is not mentioned
		if (message.author.bot || !message.mentions.has(Bot.user)) return;

		// Wit.ai integration with Discord. Nice nice nice!
		// Remove bot mention
		const msg = message.content.replace(`<@!${Bot.user.id}>`, ``);
		await WitAI.message(msg, {}).then(async (data) => {
			const command = Bot.commands.find(cmd => cmd.intentID === data.intents[0].id);

			if(!command) return;

			command.execute(message, data);
		}).catch((err) => console.error(err));

	}
	catch(err) {
		console.error(err);
	}
});

// On interaction listener
Bot.ws.on(`INTERACTION_CREATE`, async (interaction) => {
	try {
		const command = Bot.commands.get(interaction.data.name);

		// Permissions check
		if (command.permissions) {
			const perms = new Discord.Permissions((interaction.member.permissions - 2147483648));
			if (!perms || !perms.has(command.permissions)) {
				return interactionReply(interaction, 4, `You do not have the right permissions for this command! (Requires: ${command.permissions})`, null, 1 << 6);
			}
		}

		// Dev only check
		if (command.devOnly && !(interaction.member.user.id === `107697492509888512`)) {
			return interactionReply(interaction, 4, `Sorry, this is a developer only command!`, null, 1 << 6);
		}

		// Check if command has a collection
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		// Check if user is already in timestamps
		if (timestamps.has(interaction.member.user.id)) {
			const expirationTime = timestamps.get(interaction.member.user.id) + cooldownAmount;

			// Check time elapsed since the last time the user executed the command
			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return interactionReply(interaction, 4, `Please wait ${Math.round(timeLeft)} more second(s) before reusing the '/${command.name}' command, <@${interaction.member.user.id}>`, null, 1 << 6);
			}
		}

		// Add user to timestamps
		timestamps.set(interaction.member.user.id, now);
		setTimeout(() => timestamps.delete(interaction.member.user.id), cooldownAmount);

		try {
			command.execute(interaction);
		}
		catch(err) {
			console.error(err);
			return interactionReply(interaction, 4, `There was an error trying to execute that command!`, null, 1 << 6);
		}
	}
	catch(err) {
		console.error(err);
	}
});

// Login bot
Bot.login(config.token);

module.exports = {
	Bot: Bot,
};