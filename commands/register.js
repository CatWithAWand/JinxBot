const { Collection } = require(`discord.js`);
const { successEmbed, errorEmbed } = require(`../utils/embeds`);
const { reply } = require(`../utils/reply`);

module.exports = {
  name: `register`,
  description: `Register bot slash command(s) for this server.`,
  options: [
    {
      type: 3,
      name: `command`,
      description: `Register a specific slash command. If ommited all commands will be registered.`,
      default: false,
      required: false,
    },
  ],
  usage: `/register command: help`,
  devOnly: true,
  async execute(interaction) {
    const { Bot } = require(`../server`);
    let embed = successEmbed();

    if (interaction.data.options) {
      const commandName = interaction.data.options[0].value;
      const command = Bot.commands.get(commandName);

      // Check if command provided exists if not exit
      if (!command) {
        return reply(interaction, { type: 4, content: `Slash command with name **${commandName}** does not exist!`, flags: 1 << 6 });
      }
      return Bot.api.applications(Bot.user.id).guilds(interaction.guild_id).commands.post({ data: {
        name: command.name,
        description: command.description,
        options: command.options,
      } })
        .then(() => {
          embed.setTitle(`Slash command registed!`);
          embed.setDescription(`Slash command **${command.name}** was registered successfully.`);
          return reply(interaction, { type: 4, embeds: [embed] });
        })
        .catch((err) => {
          embed = errorEmbed();
          embed.setTitle(`Failed to register!`);
          embed.setDescription(`There was an error while registering slash command **${command.name}**.`);
          embed.addField(`Error`, err.message.toString(), false);
          return reply(interaction, { type: 4, embeds: [embed] });
        });
    }
    const error = new Collection();
    const cmds = Bot.commands.filter((cmd) => cmd.options);
    reply(interaction, { type: 5, content: `Thinking...` });

    // Promise due to the codes asynchronous nature
    new Promise((resolve) => {
      const loop = (i, collection) => {
        if (i === collection.size) return resolve();
        const key = Array.from(collection.keys())[i];
        const command = collection.get(key);
        // 1000ms timeout to respect the API rate limit
        const timeout = setTimeout(() => {
          return Bot.api.applications(Bot.user.id).guilds(interaction.guild_id).commands.post({ data: {
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
        console.log(`finished promise`);
        if (!(error.size === 0)) {
          embed = errorEmbed();
          embed.setTitle(`Failed to register!`);
          embed.setDescription(`There was an error while registering ${error.size} slash commands.`);
          error.forEach((command) => {
            embed.addField(command.name, `Error: ${command.error}, Code: ${command.code}`, false);
          });
          return reply(interaction, { update: true, embeds: [embed] });
        }
        embed.setTitle(`Slash commands registed!`);
        embed.setDescription(`**${cmds.size}** slash commands were registered successfully.`);
        return reply(interaction, { update: true, embeds: [embed] });
      })
      .catch(console.error);

    console.log(`exit`);
  },
};