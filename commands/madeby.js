module.exports = {
  name: `madeby`,
  description: `Developer's message.`,
  options: [
  ],
  usage: `/madeby`,
  async execute(interaction) {
    return interaction.reply({ content: `Made by <@!107697492509888512> for Retribution Tor with much ❤️.` });
  },
};