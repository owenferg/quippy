require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, AttachmentBuilder } = require('discord.js');
const { generateQuoteImage } = require('./utils/imageGen');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

// load commands
const fs = require('fs');
const path = require('path');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('deploy'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);    
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready; logged in as ${readyClient.user.tag}`);
});

// slash command handle
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try{
            await command.execute(interaction.commandName);
        } catch (error) {
            console.error(error);
            const reply = { content: 'There was an error executing this command.', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    // handle context menu commands
    if (interaction.isMessageContextMenuCommand()) {
        if (interaction.commandName === 'Create Quote') {
            try {
                await interaction.deferReply();
                
                const message = interaction.targetMessage;
                const user = message.author;
                const quote = message.content;

                if (!quote || quote.trim() === '') {
                    await interaction.editReply('Cannot create a quote from an empty message.');
                    returnl
                }

                const imageBuffer = await generateQuoteImage(user, quote);
                const attachment = new AttachmentBuilder(imageBuffer, { name: 'quote.png'});
                
                await interaction.editReply({
                    content: `Quote by ${user.displayName}:`,
                    files: [attachment]
                });
            } catch (error) {
                console.error(error);
                await interaction.editReply('There was an error creating the quote image.');
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);