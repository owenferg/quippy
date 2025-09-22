const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { generateQuoteImage } = require('../utils/imageGen');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Generate a quote image with user avatar and text')
        .addUserOption(option =>
            option.setName('text')
                .setDescription('The quote text')
                .setRequired(true)),
            
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const quoteText = interaction.options.getString('text');

        try {
            const imageBuffer = await generateQuoteImage(user, quoteText);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'quote.png' });

            await interaction.editReply({
                content: `Quote by ${user.displayName}:`,
                files: [attachment]
            });
        } catch (error) {
            console.error('Error generating quote image:', error);
            await interaction.editReply('There was an error creating the quote image!');
        }
    },
};