const { successEmbed, errorEmbed } = require(`../utils/embeds`);
const { reply } = require(`../utils/reply`);
const { reloadCfg } = require(`../utils/helper`);

module.exports = {
  name: `reload`,
  description: `Reload bot contents.`,
  options: [
    {
      type: 1,
      name: `command`,
      description: `Reload a slash command.`,
      options: [
        {
          type: 3,
          name: `name`,
          description: `Slash command name.`,
          default: false,
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: `config`,
      description: `Reload the bot's config`,
      options: [
      ],
    },
  ],
  usage: `/reload command name: help`,
  devOnly: true,
  async execute(interaction) {
    const { Bot } = require(`../server`);
    const errorEmbed1 = errorEmbed();
    const successEmbed1 = successEmbed();

    if (interaction.data.options[0].name === `command`) {
      const commandName = interaction.data.options[0].options[0].value;
      const command = Bot.commands.get(commandName);

      // Check if command provided exists if not exit
      if (!command) {
        return reply(interaction, { type: 4, content: `Slash command with name **${commandName}** does not exist!`, flags: 1 << 6 });
      }

      // Delete cached command module entry
      delete require.cache[require.resolve(`./${command.name}.js`)];

      try {
        // Load new command and set it in the collection
        const newCommand = require(`./${command.name}.js`);
        Bot.commands.set(newCommand.name, newCommand);
        successEmbed1.setTitle(`Slash command reloaded!`);
        successEmbed1.setDescription(`Slash command **${command.name}** was reloaded.`);
        return reply(interaction, { type: 4, embeds: [successEmbed1] });
      }
      catch (err) {
        console.error(err);
        errorEmbed1.setTitle(`Failed to reloaded!`);
        errorEmbed1.setDescription(`There was an error while reloading slash command **${command.name}**.`);
        errorEmbed1.addField(`Error`, err.message.toString(), false);
        return reply(interaction, { type: 4, embeds: [errorEmbed1] });
      }
    }
    else if (interaction.data.options[0].name === `config`) {
      reloadCfg(function(err) {
        if (err) {
          errorEmbed1.setTitle(`Failed to reloaded!`);
          errorEmbed1.setDescription(`There was an error while reloading the config.`);
          errorEmbed1.addField(`Error`, err.message.toString(), false);
          return reply(interaction, { type: 4, embeds: [errorEmbed1] });
        }
        successEmbed1.setTitle(`Config reloaded!`);
        successEmbed1.setDescription(`Bot's config was reloaded.`);
        return reply(interaction, { type: 4, embeds: [successEmbed1] });
      });
    }
  },
};