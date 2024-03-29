const { reply } = require(`../utils/reply`);
const { infoEmbed, errorEmbed } = require(`../utils/embeds`);

module.exports = {
  name: `help`,
  description: `Get a list of Jinx Bot's slash commands or more information about a specific command.`,
  options: [
    {
      type: 5,
      name: `dm`,
      description: `True or False\nWhether the bot will dm you or reply to the channel the command was executed.`,
      default: false,
      required: true,
    },
    {
      type: 3,
      name: `command`,
      description: `Slash command full name\nIf empty the bot will respond with a list of all commands.`,
      default: false,
      required: false,
    },
  ],
  usage: `/help dm: True or /help dm: True command: help`,
  async execute(interaction) {
    const { Bot } = require(`../server`);
    let embed = infoEmbed();
    const commands = Bot.commands;

    if (!interaction.data.options.find(opt => opt.name == `command`)) {
      embed
        .setTitle(`My commands`)
        .setDescription(`Here's a list of all my slash commands.\nYou can execute "/help dm: True command: <command_name>" to get more information regarding a specific command and its usage.`);

      commands.forEach((command) => {
        if (command.options && !command.devOnly) {
          embed.addField(command.name, command.description, false);
        }
      });
    }
    else {
      const command = commands.get(interaction.data.options[1].value) || commands.find(c => c.aliases && c.aliases.includes(interaction.data.options[1].value));
      if (!command || !command.options) {
        embed = errorEmbed()
          .setTitle(`Command not found!`)
          .setDescription(`Could not find slash command with name **${interaction.data.options[1].value}**`);
        return reply(interaction, { type: 4, embeds: [embed], dm: interaction.data.options[0].value ?? false });
      }
      embed
        .setTitle(`***/${command.name}***`)
        .setDescription(command.description);

      command.options.forEach((option) => {
        if (option.type === 1) {
          embed.addField(`Subcommand: ${option.name}`, (option.description) ? option.description : `_ _`, false);
          option.options.forEach((optn) => {
            embed.addField(optn.name, option.description, true);
          });
        }
        else {
          embed.addField(option.name, option.description, true);
        }
      });

      embed.addField(`**Usage:**`, command.usage, false);
      embed.addField(`Cooldown:`, `${command.cooldown || 3}s`, false);
      if (command.permissions) embed.addField(`Required permissions:`, command.permissions, false);
      if (command.guildOnly) embed.addField(`Guild only:`, command.guildOnly, false);
      if (command.devOnly) embed.addField(`Dev only:`, command.devOnly, false);
    }

    // Interaction response
    reply(interaction, { embeds: [embed], dm: interaction.data.options[0].value ?? false });
  },
};