const { reply } = require(`../utils/reply`);
const { redditEmbed } = require(`../utils/embeds`);
const ards = require(`ards-client`);


module.exports = {
  name: `reddit`,
  description: `Reddit command utilities.`,
  options: [
    {
      type: 1,
      name: `image`,
      description: `Posts an image from a specific or random subreddit.`,
      options: [
        {
          type: 3,
          name: `subreddit`,
          description: `Subreddit to pull the image from.`,
          default: false,
          required: false,
        },
      ],
    },
  ],
  usage: `/reddit image subreddit: memes`,
  async execute(interaction) {
    const ardsClient = new ards.Client();
    const randomSubreddits = [`funny`, `gaming`, `aww`, `pics`, `gifs`, `food`, `Art`, `dataisbeautiful`, `memes`, `wholesomememes`,
      `interestingasfuck`, `WTF`, `oddlysatisfying`, `BlackPeopleTwitter`, `facepalm`, `me_irl`, `dankmemes`, `BikiniBottomTwitter`,
      `ProgrammerHumor`, `photography`, `woahdude`, `reactiongifs`, `PewdiepieSubmissions`, `nextfuckinglevel`, `BetterEveryLoop`,
      `WatchPeopleDieInside`];
    const subreddit = (interaction.data.options[0].options) ? interaction.data.options[0].options[0].value : randomSubreddits[Math.floor(Math.random() * randomSubreddits.length)];

    ardsClient.reddit.custom(subreddit).then((res) => {
      if (!res) return reply(interaction, { type: 4, content: `Subreddit doesn't exist or no images found in specified subreddit!`, flags: 1 << 6 });
      const embed = redditEmbed(res);

      return reply(interaction, { type: 4, embeds: [embed] });

    }).catch(console.error);
  },
};