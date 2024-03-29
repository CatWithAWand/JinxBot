const fs = require(`fs`);
const { successEmbed, errorEmbed, infoEmbed } = require(`../utils/embeds`);
const { reply } = require(`../utils/reply`);
const { reloadCfg } = require(`../utils/helper`);

module.exports = {
  name: `pitch`,
  description: `Set, get, or reset the speech pitch value.`,
  options: [
    {
      type: 1,
      name: `set`,
      description: `Set a new pitch value.`,
      options: [
        {
          type: 4,
          name: `value`,
          description: `Range: -50 - +50`,
          default: false,
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: `get`,
      description: `Get the current pitch value.`,
      options: [],
    },
    {
      type: 1,
      name: `reset`,
      description: `Reset the pitch value to its default (0).`,
      options: [],
    },
  ],
  usage: `/pitch set value: +6`,
  async execute(interaction) {
    const { Bot: { config } } = require(`../server`);
    const successEmbed1 = successEmbed();
    const errorEmbed1 = errorEmbed();
    const infoEmbed1 = infoEmbed();

    if (!config.moderators.includes(`${interaction.member.user.id}`)) {
      return reply(interaction, { type: 4, content: `You cannot execute this command! It's only for my moderators.`, flags: 1 << 6 });
    }
    if (interaction.data.options[0].name === `set`) {
      const value = interaction.data.options[0].options[0].value;
      if (value < -50 || value > 50) {
        errorEmbed1.setDescription(`The value you specified of **${value}** exceeds the acceptable range. (-50 - 50)`);
        return reply(interaction, { type: 4, embeds: [errorEmbed1] });
      }
      let embed = null;
      try {
        const data = JSON.parse(fs.readFileSync(`config.json`));
        const prev_value = data.speech_pitch;
        const new_value = (value > 0) ? `+${value}` : `${value}`;
        data.speech_pitch = new_value;
        fs.writeFileSync(`config.json`, JSON.stringify(data, null, 4));
        reloadCfg(function(err) {
          if (err) throw new Error(err);
        });
        embed = successEmbed1.setDescription(`Successfully changed speech pitch value from **${prev_value}** to **${new_value}**.`);
      }
      catch (err) {
        console.error(err);
        embed = errorEmbed1.setDescription(`Encountered an error while trying to update **config**!`);
      }
      return reply(interaction, { type: 4, embeds: [embed] });
    }
    else if (interaction.data.options[0].name === `get`) {
      infoEmbed1.setDescription(`Current speech pitch value: **${config.speech_pitch}**`);
      return reply(interaction, { type: 4, embeds: [infoEmbed1] });
    }
    else {
      let embed = null;
      try {
        const data = JSON.parse(fs.readFileSync(`config.json`));
        data.speech_pitch = `0`;
        fs.writeFileSync(`config.json`, JSON.stringify(data, null, 4));
        reloadCfg(function(err) {
          if (err) throw new Error(err);
        });
        embed = successEmbed1.setDescription(`Successfully reset speech pitch value to **0**.`);
      }
      catch (err) {
        console.error(err);
        embed = errorEmbed1.setDescription(`Encountered an error while trying to update **config**!`);
      }
      return reply(interaction, { type: 4, embeds: [embed] });
    }
  },
};