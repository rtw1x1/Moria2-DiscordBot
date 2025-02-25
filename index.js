require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Partials, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.GuildMember],
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Store user page progress
const userPages = new Map();

// Welcome Embed (First Page)
const getWelcomeEmbed = () => {
    return new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🌍 Welcome to the Server!")
        .setDescription("Choose your **language** and **role** below.")
        .setImage("https://your-image-url.com/background.jpg");
};

// Verified Page (Second Page)
const getVerifiedEmbed = () => {
    return new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Verification")
        .setDescription("Click the **button** below to verify yourself and gain access.");
};

// Class Selection (Third Page)
const getClassEmbed = () => {
    return new EmbedBuilder()
        .setColor("Purple")
        .setTitle("⚔️ Choose Your Class")
        .setDescription("Select your **class** from the menu below.");
};

// Kingdom Selection (Fourth Page)
const getKingdomEmbed = () => {
    return new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🏰 Choose Your Kingdom")
        .setDescription("Select your **kingdom** from the menu below.");
};

// Selection Menus
const getLanguageMenu = new StringSelectMenuBuilder()
    .setCustomId("language_select")
    .setPlaceholder("Choose your language")
    .addOptions(
        { label: "English 🇺🇸", value: "english" },
        { label: "Español 🇪🇸", value: "spanish" },
        { label: "Français 🇫🇷", value: "french" }
    );

const getClassMenu = new StringSelectMenuBuilder()
    .setCustomId("class_select")
    .setPlaceholder("Choose your class")
    .addOptions(
        { label: "Warrior ⚔️", value: "warrior" },
        { label: "Mage 🔮", value: "mage" },
        { label: "Archer 🏹", value: "archer" }
    );

const getKingdomMenu = new StringSelectMenuBuilder()
    .setCustomId("kingdom_select")
    .setPlaceholder("Choose your kingdom")
    .addOptions(
        { label: "Red Kingdom 🔴", value: "red_kingdom" },
        { label: "Blue Kingdom 🔵", value: "blue_kingdom" },
        { label: "Green Kingdom 🟢", value: "green_kingdom" }
    );

// Navigation Buttons
const getNavigationButtons = (currentPage) => {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("prev_page")
            .setLabel("⬅️ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 1),
        new ButtonBuilder()
            .setCustomId("next_page")
            .setLabel("Next ➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 4)
    );
};

// Verified Button
const getVerifyButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId("verify")
        .setLabel("✅ Verify")
        .setStyle(ButtonStyle.Success)
);

// When a member joins, send the welcome embed
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === "welcome"); // Change this

    if (!welcomeChannel) return;

    userPages.set(member.id, 1); // Set user to page 1

    await welcomeChannel.send({
        content: `Welcome, ${member}!`,
        embeds: [getWelcomeEmbed()],
        components: [new ActionRowBuilder().addComponents(getLanguageMenu), getNavigationButtons(1)]
    });
});

// Handle interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const member = interaction.member;
    const guild = interaction.guild;

    // Get user's current page
    let currentPage = userPages.get(member.id) || 1;

    // Handle Language Selection
    if (interaction.customId === "language_select") {
        const roleMap = {
            english: "English Speaker",
            spanish: "Spanish Speaker",
            french: "French Speaker"
        };

        const selectedValue = interaction.values[0];
        const roleName = roleMap[selectedValue];

        const role = guild.roles.cache.find(r => r.name === roleName);
        if (!role) return interaction.reply({ content: "Role not found!", ephemeral: true });

        await member.roles.add(role);
        await interaction.reply({ content: `✅ You have been assigned the **${roleName}** role!`, ephemeral: true });
    }

    // Handle Class Selection
    if (interaction.customId === "class_select") {
        const roleMap = {
            warrior: "Warrior",
            mage: "Mage",
            archer: "Archer"
        };

        const selectedValue = interaction.values[0];
        const roleName = roleMap[selectedValue];

        const role = guild.roles.cache.find(r => r.name === roleName);
        if (!role) return interaction.reply({ content: "Role not found!", ephemeral: true });

        await member.roles.add(role);
        await interaction.reply({ content: `✅ You are now a **${roleName}**!`, ephemeral: true });
    }

    // Handle Kingdom Selection
    if (interaction.customId === "kingdom_select") {
        const roleMap = {
            red_kingdom: "Red Kingdom",
            blue_kingdom: "Blue Kingdom",
            green_kingdom: "Green Kingdom"
        };

        const selectedValue = interaction.values[0];
        const roleName = roleMap[selectedValue];

        const role = guild.roles.cache.find(r => r.name === roleName);
        if (!role) return interaction.reply({ content: "Role not found!", ephemeral: true });

        await member.roles.add(role);
        await interaction.reply({ content: `✅ You joined the **${roleName}**!`, ephemeral: true });
    }

    // Handle Verification
    if (interaction.customId === "verify") {
        const verifyRole = guild.roles.cache.find(r => r.name === "Verified");
        if (!verifyRole) return interaction.reply({ content: "Verification role not found!", ephemeral: true });

        await member.roles.add(verifyRole);
        await interaction.reply({ content: "✅ You are now Verified!", ephemeral: true });
    }

    // Handle Page Navigation
    if (interaction.customId === "next_page" || interaction.customId === "prev_page") {
        currentPage = interaction.customId === "next_page" ? currentPage + 1 : currentPage - 1;
        userPages.set(member.id, currentPage);

        const embeds = [getWelcomeEmbed(), getVerifiedEmbed(), getClassEmbed(), getKingdomEmbed()];
        const components = [
            new ActionRowBuilder().addComponents(getLanguageMenu),
            getVerifyButton,
            new ActionRowBuilder().addComponents(getClassMenu),
            new ActionRowBuilder().addComponents(getKingdomMenu)
        ];

        await interaction.update({
            embeds: [embeds[currentPage - 1]],
            components: [components[currentPage - 1], getNavigationButtons(currentPage)]
        });
    }
});

client.login(process.env.TOKEN);
