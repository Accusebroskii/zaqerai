import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Guild,
  type Interaction,
  type TextChannel,
} from "discord.js";
import { logger } from "../lib/logger";
import {
  DEFAULT_EMBED_COLOR,
  DISCORD_SERVER_URL,
  X_PROFILE_URL,
  optimizationServices,
  overclockingServices,
  termsOfService,
  defaultTicketSettings,
  type TicketSettings,
} from "./config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TICKET_BUTTON_ID = "zaqerai:open-ticket";
const CLOSE_BUTTON_ID = "zaqerai:close-ticket";
const GIVEAWAY_BUTTON_PREFIX = "zaqerai:giveaway:";
const TICKET_CONFIG_PATH =
  process.env["TICKET_CONFIG_PATH"] ??
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../data/ticket-config.json",
  );

const commands = [
  new SlashCommandBuilder()
    .setName("book-optimization")
    .setDescription("Post the PC optimization services card.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the services card should be sent.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("ticket_channel")
        .setDescription("The category where new private tickets should be created.")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("embed_color")
        .setDescription("Embed color as a hex value, for example #7c3aed.")
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("join")
    .setDescription("Share the Zaqerai Tweaks Discord invite."),
  new SlashCommandBuilder()
    .setName("x")
    .setDescription("Get the Zaqerai Optimizations X profile."),
  new SlashCommandBuilder()
    .setName("tos")
    .setDescription("Publish the Terms of Service embed to a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the Terms of Service should be sent.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("embed_color")
        .setDescription("Embed color as a hex value, for example #7c3aed.")
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("overclocking")
    .setDescription("Publish the Overclocking Services panel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel where the services panel should be sent.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("ticket_channel")
        .setDescription("The category where new private tickets should be created.")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("embed_color")
        .setDescription("Embed color as a hex value, for example #7c3aed.")
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Post a custom branded embed.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages.toString())
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The embed title.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The embed description.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("embed_color")
        .setDescription("Embed color as a hex value.")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("image_url")
        .setDescription("Optional image URL.")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("Optional footer text.")
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Manage giveaways.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages.toString())
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Start a giveaway in the current channel.")
        .addStringOption((option) =>
          option
            .setName("prize")
            .setDescription("What can people win?")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("Examples: 30s, 10m, 2h, 1d.")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("winners")
            .setDescription("Number of winners.")
            .setMinValue(1)
            .setMaxValue(20)
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("embed_color")
            .setDescription("Embed color as a hex value.")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("End a giveaway immediately.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("The giveaway message ID.")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reroll")
        .setDescription("Pick a new winner for an ended giveaway.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("The giveaway message ID.")
            .setRequired(true),
        ),
    ),
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Manage the ticket system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels.toString())
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Create the ticket category, channel, and ticket panel.")
        .addStringOption((option) =>
          option
            .setName("category_name")
            .setDescription("Ticket category name.")
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("channel_name")
            .setDescription("Ticket panel channel name.")
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("embed_color")
            .setDescription("Panel embed color as a hex value.")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("customize")
        .setDescription("Customize the ticket panel and ticket messages.")
        .addStringOption((option) =>
          option
            .setName("panel_title")
            .setDescription("Ticket panel title.")
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("panel_description")
            .setDescription("Ticket panel description.")
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("open_message")
            .setDescription("Message shown inside a new ticket.")
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("close_button")
            .setDescription("Text on the close-ticket button.")
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("close_message")
            .setDescription("Message shown before a ticket closes.")
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("embed_color")
            .setDescription("Ticket embed color as a hex value.")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("close")
        .setDescription("Close the ticket channel you are currently in."),
    ),
];

function parseEmbedColor(input: string | null): number {
  if (!input) {
    return DEFAULT_EMBED_COLOR;
  }

  const normalized = input.trim().replace(/^#/, "");
  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return DEFAULT_EMBED_COLOR;
  }

  return Number.parseInt(normalized, 16);
}

type GiveawayState = {
  messageId: string;
  channelId: string;
  prize: string;
  winners: number;
  entries: Set<string>;
  previousWinners: Set<string>;
  ended: boolean;
  timer?: ReturnType<typeof setTimeout>;
};

const giveaways = new Map<string, GiveawayState>();
const ticketSettingsCache = new Map<string, TicketSettings>();

async function getTicketSettings(guildId: string): Promise<TicketSettings> {
  const cached = ticketSettingsCache.get(guildId);
  if (cached) {
    return cached;
  }

  try {
    const data = JSON.parse(await readFile(TICKET_CONFIG_PATH, "utf8")) as Record<
      string,
      Partial<TicketSettings>
    >;
    const settings = {
      ...defaultTicketSettings,
      ...(data[guildId] ?? {}),
    };
    ticketSettingsCache.set(guildId, settings);
    return settings;
  } catch {
    const settings = { ...defaultTicketSettings };
    ticketSettingsCache.set(guildId, settings);
    return settings;
  }
}

async function saveTicketSettings(
  guildId: string,
  settings: TicketSettings,
): Promise<void> {
  ticketSettingsCache.set(guildId, settings);
  let data: Record<string, Partial<TicketSettings>> = {};

  try {
    data = JSON.parse(await readFile(TICKET_CONFIG_PATH, "utf8")) as Record<
      string,
      Partial<TicketSettings>
    >;
  } catch {
    data = {};
  }

  data[guildId] = settings;
  await mkdir(path.dirname(TICKET_CONFIG_PATH), { recursive: true });
  await writeFile(TICKET_CONFIG_PATH, JSON.stringify(data, null, 2), "utf8");
}

function ticketButtonRow(categoryId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${TICKET_BUTTON_ID}:${categoryId}`)
      .setLabel("📩  Make ticket")
      .setStyle(ButtonStyle.Primary),
  );
}

function closeButtonRow(settings: TicketSettings): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CLOSE_BUTTON_ID)
      .setLabel(settings.closeButton)
      .setStyle(ButtonStyle.Danger),
  );
}

function ticketPanelEmbed(settings: TicketSettings): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(settings.embedColor)
    .setTitle(settings.panelTitle)
    .setDescription(settings.panelDescription)
    .setFooter({ text: "Zaqerai Optimizations Support" })
    .setTimestamp();
}

function safeChannelName(value: string, fallback: string): string {
  const name = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return name || fallback;
}

function getTextChannel(
  interaction: ChatInputCommandInteraction,
  name: string,
): TextChannel | null {
  const channel = interaction.options.getChannel(name, true);
  return channel.type === ChannelType.GuildText ? (channel as TextChannel) : null;
}

function getCurrentTextChannel(
  interaction: ChatInputCommandInteraction,
): TextChannel | null {
  return interaction.channel?.type === ChannelType.GuildText
    ? (interaction.channel as TextChannel)
    : null;
}

async function publishTerms(interaction: ChatInputCommandInteraction) {
  const channel = getTextChannel(interaction, "channel");
  if (!channel) {
    await interaction.reply({
      content: "Please choose a text channel.",
      ephemeral: true,
    });
    return;
  }

  const color = parseEmbedColor(
    interaction.options.getString("embed_color"),
  );
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle("Terms of Service")
    .setDescription(termsOfService)
    .setFooter({ text: "Zaqerai Optimizations" })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await interaction.reply({
    content: `Terms of Service posted in ${channel}.`,
    ephemeral: true,
  });
}

async function publishServices(
  interaction: ChatInputCommandInteraction,
  description: string,
  title: string,
) {
  const channel = getTextChannel(interaction, "channel");
  const ticketCategory = interaction.options.getChannel("ticket_channel", true);

  if (!channel || ticketCategory.type !== ChannelType.GuildCategory) {
    await interaction.reply({
      content: "Please choose a text channel and a ticket category.",
      ephemeral: true,
    });
    return;
  }

  const color = parseEmbedColor(
    interaction.options.getString("embed_color"),
  );
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: "Use the button below to contact Zaqerai Optimizations." })
    .setTimestamp();

  await channel.send({
    embeds: [embed],
    components: [ticketButtonRow(ticketCategory.id)],
  });
  await interaction.reply({
    content: `${title} panel posted in ${channel}. New tickets will be created in ${ticketCategory}.`,
    ephemeral: true,
  });
}

async function handleTicketOpen(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.guild || !interaction.member) {
    return;
  }

  const guild = interaction.guild;
  const member = interaction.member;
  const existingTicket = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.name === `ticket-${interaction.user.id}`,
  );

  if (existingTicket) {
    await interaction.reply({
      content: `You already have an open ticket: ${existingTicket}.`,
      ephemeral: true,
    });
    return;
  }

  const categoryIdFromPanel = interaction.customId.split(":")[2];
  const categoryId =
    categoryIdFromPanel ?? process.env["DISCORD_TICKET_CATEGORY_ID"];
  const category = categoryId
    ? guild.channels.cache.get(categoryId)
    : guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory &&
          channel.name.toLowerCase().includes("ticket"),
      );

  if (!category || category.type !== ChannelType.GuildCategory) {
    await interaction.reply({
      content:
        "The ticket category is not configured yet. Ask an administrator to set DISCORD_TICKET_CATEGORY_ID or publish a services panel with /book-optimization or /overclocking.",
      ephemeral: true,
    });
    return;
  }

  const settings = await getTicketSettings(guild.id);
  const ticket = await guild.channels.create({
    name: `ticket-${interaction.user.id}`,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `Zaqerai support ticket for ${interaction.user.tag}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: guild.members.me?.id ?? guild.client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  await ticket.send({
    content: `${member}`,
    embeds: [
      new EmbedBuilder()
        .setColor(settings.embedColor)
        .setTitle(settings.panelTitle)
        .setDescription(settings.openMessage)
        .setFooter({ text: "Zaqerai Optimizations Support" })
        .setTimestamp(),
    ],
    components: [closeButtonRow(settings)],
  });

  await interaction.reply({
    content: `Your private ticket is ready: ${ticket}.`,
    ephemeral: true,
  });
}

async function handleTicketClose(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.channel) {
    return;
  }

  const settings = interaction.guild
    ? await getTicketSettings(interaction.guild.id)
    : defaultTicketSettings;
  await interaction.reply({ content: settings.closeMessage });
  setTimeout(() => {
    void interaction.channel?.delete("Ticket closed by user");
  }, 3000);
}

async function closeTicketChannel(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const channel = getCurrentTextChannel(interaction);
  if (!channel || !channel.name.startsWith("ticket-")) {
    await interaction.reply({
      content: "This command can only be used inside a ticket channel.",
      ephemeral: true,
    });
    return;
  }

  const settings = interaction.guild
    ? await getTicketSettings(interaction.guild.id)
    : defaultTicketSettings;
  await interaction.reply({ content: settings.closeMessage });
  setTimeout(() => {
    void channel.delete("Ticket closed by command");
  }, 3000);
}

async function setupTicketSystem(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: "This command can only be used inside a server.",
      ephemeral: true,
    });
    return;
  }

  const categoryName =
    interaction.options.getString("category_name") ?? "Zaqerai Tickets";
  const channelName =
    interaction.options.getString("channel_name") ?? "make-ticket";
  const category = await interaction.guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
  });
  const panelChannel = await interaction.guild.channels.create({
    name: safeChannelName(channelName, "make-ticket"),
    type: ChannelType.GuildText,
    parent: category.id,
  });
  const settings = await getTicketSettings(interaction.guild.id);
  const color = interaction.options.getString("embed_color");
  if (color) {
    settings.embedColor = parseEmbedColor(color);
    await saveTicketSettings(interaction.guild.id, settings);
  }

  await panelChannel.send({
    embeds: [ticketPanelEmbed(settings)],
    components: [ticketButtonRow(category.id)],
  });
  await interaction.reply({
    content: `Ticket system created: ${panelChannel} with new tickets under ${category}.`,
    ephemeral: true,
  });
}

async function customizeTicketSystem(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: "This command can only be used inside a server.",
      ephemeral: true,
    });
    return;
  }

  const settings = await getTicketSettings(interaction.guild.id);
  const panelTitle = interaction.options.getString("panel_title");
  const panelDescription = interaction.options.getString("panel_description");
  const openMessage = interaction.options.getString("open_message");
  const closeButton = interaction.options.getString("close_button");
  const closeMessage = interaction.options.getString("close_message");
  const embedColor = interaction.options.getString("embed_color");

  if (panelTitle) settings.panelTitle = panelTitle;
  if (panelDescription) settings.panelDescription = panelDescription;
  if (openMessage) settings.openMessage = openMessage;
  if (closeButton) settings.closeButton = closeButton;
  if (closeMessage) settings.closeMessage = closeMessage;
  if (embedColor) settings.embedColor = parseEmbedColor(embedColor);

  await saveTicketSettings(interaction.guild.id, settings);
  await interaction.reply({
    content:
      "Ticket settings saved. Run `/ticket setup` again to publish a fresh panel with the updated text.",
    ephemeral: true,
  });
}

function parseDuration(input: string): number | null {
  const match = /^(\d+(?:\.\d+)?)\s*(s|m|h|d)$/i.exec(input.trim());
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  const duration = amount * multipliers[match[2].toLowerCase()];
  return Number.isFinite(duration) && duration > 0 && duration <= 7 * 86_400_000
    ? duration
    : null;
}

function giveawayButtonRow(messageId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${GIVEAWAY_BUTTON_PREFIX}${messageId}`)
      .setLabel("🎉 Enter giveaway")
      .setStyle(ButtonStyle.Primary),
  );
}

function pickGiveawayWinners(
  state: GiveawayState,
  excludePrevious: boolean,
): string[] {
  const available = [...state.entries].filter(
    (entry) => !excludePrevious || !state.previousWinners.has(entry),
  );
  const winners: string[] = [];
  while (available.length > 0 && winners.length < state.winners) {
    const index = Math.floor(Math.random() * available.length);
    const [winner] = available.splice(index, 1);
    if (winner) {
      winners.push(winner);
    }
  }
  return winners;
}

async function finishGiveaway(
  client: Client,
  state: GiveawayState,
): Promise<string[]> {
  if (state.timer) {
    clearTimeout(state.timer);
  }
  state.ended = true;
  const channel = client.channels.cache.get(state.channelId);
  if (!channel || channel.type !== ChannelType.GuildText) {
    return [];
  }

  const message = await channel.messages.fetch(state.messageId);
  const winners = pickGiveawayWinners(state, false);
  winners.forEach((winner) => state.previousWinners.add(winner));
  await message.edit({
    embeds: [
      new EmbedBuilder()
        .setColor(DEFAULT_EMBED_COLOR)
        .setTitle("🎉 Giveaway ended")
        .setDescription(
          winners.length > 0
            ? `Prize: **${state.prize}**\n\nWinner${winners.length === 1 ? "" : "s"}: ${winners
                .map((winner) => `<@${winner}>`)
                .join(", ")}`
            : `Prize: **${state.prize}**\n\nNo one entered this giveaway.`,
        )
        .setFooter({ text: "Zaqerai Optimizations Giveaways" })
        .setTimestamp(),
    ],
    components: [],
  });
  await channel.send({
    content:
      winners.length > 0
        ? `Congratulations ${winners.map((winner) => `<@${winner}>`).join(", ")}!`
        : "The giveaway ended with no entries.",
  });
  return winners;
}

async function startGiveaway(
  interaction: ChatInputCommandInteraction,
  client: Client,
): Promise<void> {
  const channel = getCurrentTextChannel(interaction);
  if (!channel) {
    await interaction.reply({
      content: "Giveaways must be started in a text channel.",
      ephemeral: true,
    });
    return;
  }

  const durationInput = interaction.options.getString("duration", true);
  const duration = parseDuration(durationInput);
  if (!duration) {
    await interaction.reply({
      content: "Use a duration like `30s`, `10m`, `2h`, or `1d` (maximum 7d).",
      ephemeral: true,
    });
    return;
  }

  const prize = interaction.options.getString("prize", true);
  const winners = interaction.options.getInteger("winners", true);
  const color = parseEmbedColor(
    interaction.options.getString("embed_color"),
  );
  const endsAt = Date.now() + duration;

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(color)
        .setTitle("🎉 Giveaway")
        .setDescription(
          `Prize: **${prize}**\nWinners: **${winners}**\nEnds: <t:${Math.floor(
            endsAt / 1000,
          )}:R>\n\nClick the button below to enter.`,
        )
        .setFooter({ text: "Zaqerai Optimizations Giveaways" })
        .setTimestamp(),
    ],
  });

  const message = await interaction.fetchReply();
  const state: GiveawayState = {
    messageId: message.id,
    channelId: channel.id,
    prize,
    winners,
    entries: new Set<string>(),
    previousWinners: new Set<string>(),
    ended: false,
  };
  await message.edit({ components: [giveawayButtonRow(message.id)] });
  state.timer = setTimeout(() => {
    void finishGiveaway(client, state).catch((error: unknown) => {
      logger.error({ err: error }, "Scheduled giveaway end failed");
    });
  }, duration);
  giveaways.set(message.id, state);
  await interaction.followUp({
    content: `Giveaway started. Message ID: \`${message.id}\``,
    ephemeral: true,
  });
}

async function endGiveaway(
  interaction: ChatInputCommandInteraction,
  client: Client,
  reroll: boolean,
): Promise<void> {
  const messageId = interaction.options.getString("message_id", true);
  const state = giveaways.get(messageId);
  if (!state) {
    await interaction.reply({
      content:
        "I can only manage giveaways started since the bot was last restarted.",
      ephemeral: true,
    });
    return;
  }

  if (reroll) {
    if (!state.ended) {
      await interaction.reply({
        content: "That giveaway has not ended yet.",
        ephemeral: true,
      });
      return;
    }
    const channel = client.channels.cache.get(state.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "I cannot find the giveaway channel.",
        ephemeral: true,
      });
      return;
    }
    const winners = pickGiveawayWinners(state, true);
    if (winners.length === 0) {
      await interaction.reply({
        content: "There are no additional entrants to reroll.",
        ephemeral: true,
      });
      return;
    }
    winners.forEach((winner) => state.previousWinners.add(winner));
    await channel.send({
      content: `New giveaway winner${winners.length === 1 ? "" : "s"}: ${winners
        .map((winner) => `<@${winner}>`)
        .join(", ")}!`,
    });
    await interaction.reply({
      content: `Rerolled winner${winners.length === 1 ? "" : "s"}: ${winners
        .map((winner) => `<@${winner}>`)
        .join(", ")}.`,
      ephemeral: true,
    });
    return;
  }

  if (state.ended) {
    await interaction.reply({
      content: "That giveaway has already ended.",
      ephemeral: true,
    });
    return;
  }

  const winners = await finishGiveaway(client, state);
  await interaction.reply({
    content:
      winners.length > 0
        ? `Giveaway ended with ${winners.map((winner) => `<@${winner}>`).join(", ")}.`
        : "Giveaway ended with no entries.",
    ephemeral: true,
  });
}

async function handleGiveawayButton(interaction: Interaction) {
  if (!interaction.isButton()) {
    return;
  }
  const messageId = interaction.customId.slice(GIVEAWAY_BUTTON_PREFIX.length);
  const state = giveaways.get(messageId);
  if (!state || state.ended) {
    await interaction.reply({
      content: "This giveaway has already ended.",
      ephemeral: true,
    });
    return;
  }
  state.entries.add(interaction.user.id);
  await interaction.reply({
    content: "You are entered in the giveaway.",
    ephemeral: true,
  });
}

async function postCustomEmbed(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const title = interaction.options.getString("title", true);
  const description = interaction.options.getString("description", true);
  const imageUrl = interaction.options.getString("image_url");
  const footer = interaction.options.getString("footer");
  const embed = new EmbedBuilder()
    .setColor(parseEmbedColor(interaction.options.getString("embed_color")))
    .setTitle(title)
    .setDescription(description);
  if (imageUrl) embed.setImage(imageUrl);
  if (footer) embed.setFooter({ text: footer });

  await interaction.reply({ embeds: [embed] });
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  if (interaction.commandName === "join") {
    const embed = new EmbedBuilder()
      .setColor(DEFAULT_EMBED_COLOR)
      .setTitle("Zaqerai Optimizations")
      .setDescription(
        "Join the official Zaqerai Optimizations Discord server for PC optimization services, support, and announcements.",
      )
      .setURL(DISCORD_SERVER_URL)
      .setFooter({ text: "Zaqerai Optimizations" });

    await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Join the Discord server")
            .setStyle(ButtonStyle.Link)
            .setURL(DISCORD_SERVER_URL),
        ),
      ],
    });
    return;
  }

  if (interaction.commandName === "x") {
    const embed = new EmbedBuilder()
      .setColor(DEFAULT_EMBED_COLOR)
      .setTitle("Follow Zaqerai Optimizations on X")
      .setDescription("Follow the latest updates, announcements, and offers.")
      .setURL(X_PROFILE_URL)
      .setFooter({ text: "ZaqeraiTweaks" });

    await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Open X profile")
            .setStyle(ButtonStyle.Link)
            .setURL(X_PROFILE_URL),
        ),
      ],
    });
    return;
  }

  if (interaction.commandName === "tos") {
    await publishTerms(interaction);
    return;
  }

  if (interaction.commandName === "book-optimization") {
    await publishServices(
      interaction,
      optimizationServices,
      "Optimization Services",
    );
    return;
  }

  if (interaction.commandName === "overclocking") {
    await publishServices(
      interaction,
      overclockingServices,
      "Overclocking Services",
    );
    return;
  }

  if (interaction.commandName === "embed") {
    await postCustomEmbed(interaction);
    return;
  }

  if (interaction.commandName === "giveaway") {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "start") {
      await startGiveaway(interaction, interaction.client);
    } else if (subcommand === "end") {
      await endGiveaway(interaction, interaction.client, false);
    } else if (subcommand === "reroll") {
      await endGiveaway(interaction, interaction.client, true);
    }
    return;
  }

  if (interaction.commandName === "ticket") {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "setup") {
      await setupTicketSystem(interaction);
    } else if (subcommand === "customize") {
      await customizeTicketSystem(interaction);
    } else if (subcommand === "close") {
      await closeTicketChannel(interaction);
    }
  }
}

async function registerCommands(client: Client<true>, guild: Guild) {
  const rest = new REST({ version: "10" }).setToken(
    process.env["DISCORD_BOT_TOKEN"] as string,
  );
  await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), {
    body: commands.map((command) => command.toJSON()),
  });
  logger.info({ guildId: guild.id }, "Discord slash commands registered");
}

export function startDiscordBot(): void {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) {
    logger.warn(
      "DISCORD_BOT_TOKEN is not set; API server is running but the Discord bot is disabled.",
    );
    return;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });

  client.once("ready", async (readyClient) => {
    logger.info({ user: readyClient.user.tag }, "Discord bot connected");
    try {
      const guildId = process.env["DISCORD_GUILD_ID"];
      if (guildId) {
        const guild = await readyClient.guilds.fetch(guildId);
        await registerCommands(readyClient, guild);
        return;
      }

      const rest = new REST({ version: "10" }).setToken(token);
      await rest.put(Routes.applicationCommands(readyClient.user.id), {
        body: commands.map((command) => command.toJSON()),
      });
      logger.warn(
        "DISCORD_GUILD_ID is not set; slash commands were registered globally and may take up to an hour to appear.",
      );
    } catch (error) {
      logger.error({ err: error }, "Discord slash command registration failed");
    }
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
      } else if (
        interaction.isButton() &&
        interaction.customId.startsWith(GIVEAWAY_BUTTON_PREFIX)
      ) {
        await handleGiveawayButton(interaction);
      } else if (
        interaction.isButton() &&
        interaction.customId.startsWith(`${TICKET_BUTTON_ID}:`)
      ) {
        await handleTicketOpen(interaction);
      } else if (
        interaction.isButton() &&
        interaction.customId === CLOSE_BUTTON_ID
      ) {
        await handleTicketClose(interaction);
      }
    } catch (error) {
      logger.error({ err: error }, "Discord interaction failed");
      if (interaction.isRepliable() && !interaction.replied) {
        await interaction.reply({
          content:
            "Something went wrong while handling that request. Please try again.",
          ephemeral: true,
        });
      }
    }
  });

  client.login(token).catch((error: unknown) => {
    logger.error({ err: error }, "Discord bot failed to connect");
  });
}