const fs = require(`fs`);
const { Client, Intents, Collection, Permissions } = require(`discord.js`);
const Schedule = require(`node-schedule`);
const Express = require(`express`);
const { Wit, log } = require(`node-wit`);
const { checkToxicity } = require(`./utils/helper`);
const { errorEmbed } = require(`./utils/embeds`);
// const { reply } = require(`./utils/reply`);
const voiceComprehension = require(`./speech/voiceComprehension`);
// const qna = require(`./tensorflow/qna`);

// Discord bot
const Bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Load commands
Bot.commands = new Collection();
const cooldowns = new Collection();
const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(`.js`));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  Bot.commands.set(command.name, command);
}

// Load config
Bot.config = require(`./config.json`);

// Express
const App = Express();
App.use(Express.json());

// WitAI
const WitAI = new Wit({
  accessToken: Bot.config.witai_token,
  logger: new log.Logger(log.DEBUG),
});

// Other constants
const activities = Bot.config.activities;
Bot.connUsers = new Collection();

// Schedule jobs
// eslint-disable-next-line no-unused-vars
const botActivity = Schedule.scheduleJob(`*/10 * * * *`, function() {
  Bot.user.setActivity(activities[Math.floor(Math.random() * activities.length)].toString(), { type: `PLAYING` });
});
// eslint-disable-next-line no-unused-vars
const speechStatusReset = Schedule.scheduleJob(`0 2 13 * *`, function() {
  // Configh speech_quota_usage
  const data = JSON.parse(fs.readFileSync(`config.json`));
  data.speech_quota_usage = 0;
  fs.writeFileSync(`config.json`, JSON.stringify(data, null, 4));

  // Wake word ppn

});


// Router - App endpoints
App.post(`/:event`, async (req, res) => {
  if (req.params.event === `send`) {
    const data = req.body;
    Bot.channels.fetch(data.channelID)
      .then((channel) => channel.send(data.message)).catch(console.error);
    return res.sendStatus(200);
  }
  else if (req.params.event === `test`) {
    Bot.channels.fetch(`809417833380708385`)
      .then((channel) => channel.send(`Test`)).catch(console.error);
    return res.sendStatus(200);
  }
  res.sendStatus(403);
});


// On bot ready listener
Bot.once(`ready`, async () => {
  Bot.user.setActivity(`it's Alacrity time`, { type: `PLAYING` });
  // qna.load();
  console.log(`Bot is online!`);
});

// On guild join listener
Bot.on(`guildCreate`, async (guild) => {
  // Set custom server nickname
  await guild.members.fetch(Bot.user.id)
    .then((botMember) => {
      return botMember.setNickname(`[TLS]⛧Jinx ⛧`);
    })
    .catch(console.error);
  // Find first text channel with SEND_MESSAGES permission for @everyone
  const firstChannel = guild.channels.cache.filter(channel => channel.type === `text` && channel.permissionsFor(guild.roles.everyone.id).has(`SEND_MESSAGES`) === true).find(c => c.position === 0);
  const error = new Collection();
  const errorEmbed1 = errorEmbed();
  errorEmbed1.setDescription(`Hey, I joined but I could not register the following slash commands. Anyway where's TutminatorT92?`);
  const cmds = Bot.commands.filter((cmd) => cmd.options);

  // Promise due to the codes asynchronous nature
  new Promise((resolve) => {
    const loop = (i, collection) => {
      if (i === collection.size) return resolve();
      const key = Array.from(collection.keys())[i];
      const command = collection.get(key);

      // 1000ms timeout to respect the API rate limit
      const timeout = setTimeout(() => {
        return Bot.api.applications(Bot.user.id).guilds(guild.id).commands.post({ data: {
          name: command.name,
          description: command.description,
          options: command.options,
        } })
          .catch((err) => {
            error.set(command.name, { name: command.name, error: err.message, code: err.code.toString() });
            console.error(err);
          })
          .finally(() => {
            i++;
            clearTimeout(timeout);
            loop(i, collection);
          });
      }, 2000);
    };
    loop(0, cmds);
  })
    .then(() => {
      if (!(error.size === 0)) {
        error.forEach((command) => {
          errorEmbed1.addField(command.name, `Error: ${command.error}, Code: ${command.code}`, false);
        });
        return firstChannel.send(errorEmbed1);
      }
      return firstChannel.send(`I set up my commands and all. I prayed to the gods of Sand and Air, and I'm ready for TutminatorT92!`);
    })
    .catch(console.error);
});

// On message listener
Bot.on(`messageCreate`, async (message) => {
  try {
    // Exit if the author is the bot or the bot is not mentioned
    if (message.author.bot || !message.mentions.has(Bot.user)) return;

    // Remove bot mention
    const msg = message.content.replace(`<@!${Bot.user.id}>`, ``);

    // WitAI api call
    await WitAI.message(msg, {}).then(async (data) => {
      const command = Bot.commands.find(cmd => cmd.intentID === (data.intents?.[0]?.id ?? 0));

      if(command) return command.execute(message, data);

      const toxicityReply = await checkToxicity(msg);
      return message.reply(toxicityReply ?? Bot.config.intent_response.no_intent[Math.floor(Math.random() * Bot.config.intent_response.no_intent.length)].toString());
    }).catch(console.error);

  }
  catch(err) {
    console.error(err);
  }
});

// On interaction listener
Bot.on(`interactionCreate`, async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    const command = Bot.commands.get(interaction.commandName);

    // Permissions check
    if (command.permissions) {
      const perms = new Permissions((interaction.member.permissions - 2147483648));
      if (!perms || !perms.has(command.permissions)) {return interaction.reply({ content: `You do not have the right permissions for this command! (Requires: ${command.permissions})`, ephemeral: true });}
    }

    // Dev only check
    if (command.devOnly && !(interaction.member.user.id === `107697492509888512`)) {return interaction.reply({ content: `Sorry, this is a developer only command!`, ephemeral: true });}

    // Check if command has a collection
    if (!cooldowns.has(command.name)) {cooldowns.set(command.name, new Collection());}

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // Check if user is already in timestamps
    if (timestamps.has(interaction.member.user.id)) {
      const expirationTime = timestamps.get(interaction.member.user.id) + cooldownAmount;

      // Check time elapsed since the last time the user executed the command
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.reply({ content: `Please wait ${Math.round(timeLeft)} more second(s) before reusing the '/${command.name}' command, <@${interaction.member.user.id}>`, ephemeral: true });
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
      return interaction.reply({ content: `There was an error trying to execute that command!`, ephemeral: true });
    }
  }
  catch(err) {
    console.error(err);
  }
});

// On voiceStateUpdate listener
// This is used to initiate/destroy voice comprehension handlers dynamically
Bot.on(`voiceStateUpdate`, async (oldState, newState) => {
  // Ignore bot's voiceStateUpdate states

  if ((oldState.channelID == null) && (newState.id !== Bot.user.id)) {
    // Connected to a voice channel
    if (Bot.connUsers.get(newState.id)) return;
    // If the user already exists in the collection, user is already initiated
    const voiceConnection = Bot.voice.connections.find(connection => connection.channel.guild.id === newState.guild.id);

    if (voiceConnection && voiceConnection.channel.members.has(newState.id)) {
      // Member is part of connection
      // Initiate and create handlers for the user
      return await voiceComprehension.initiate(voiceConnection, newState.member.user, newState.guild.id);
    }
  }
  else if (newState.channelID == null) {
    // Disconnected from a voice channel
    if (newState.id === Bot.user.id) {
      // If bot was force disconnected
      oldState.channel.members.forEach(async (member) => {
        await voiceComprehension.destroy(member.user);
      });
      return;
    }
    if (!Bot.connUsers.get(oldState.id)) return;
    // If the user exists in the collection, user has handlers
    return await voiceComprehension.destroy(oldState.member.user);
    // Destroy user's handlers
  }
  else if ((newState.channelID != oldState.channelID) && (newState.id !== Bot.user.id)) {
    // Changed voice channel
    const voiceConnection = Bot.voice.connections.find(connection => connection.channel.guild.id === newState.guild.id);

    if (voiceConnection) {
      if (oldState.channelID === voiceConnection.channel.id) {
        // User has left the connection channel
        return await voiceComprehension.destroy(oldState.member.user);
      }
      else if (newState.channelID === voiceConnection.channel.id) {
        // User has joined the connection channel
        return await voiceComprehension.initiate(voiceConnection, newState.member.user, newState.guild.id);
      }
    }
  }

});

// Login bot
Bot.login(Bot.config.token);

// Initiate server to listen on port 3000
App.listen(3000, () => console.log(`App endpoints listening on port 3000`));

// Lazy things
// process.on(`uncaughtException`, function(err) {
//   console.log(`Caught Exception: ` + err);
// });
// process.on(`unhandledRejection`, function(err) {
//   console.log(`Caught Rejection: ` + err);
// });

module.exports = {
  Bot: Bot,
  Config: Bot.config,
};