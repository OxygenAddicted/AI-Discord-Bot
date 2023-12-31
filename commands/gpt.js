const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

const CHANNEL_ID = process.env['CHANNEL_ID'];

module.exports = {
    data: new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Ask ChatGPT a question')
    .addStringOption(option => option.setName('prompt').setDescription('The prompt for the ChatGPT').setRequired(true)),
    async execute(interaction){

        await interaction.reply({ content: `Please wait a minute...`});

        const { options } = interaction;
        const prompt = options.getString('prompt');

        if (interaction.channel.id !== CHANNEL_ID) {
            return interaction.editReply('You can not use the bot here.');
        }

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.goto('https://chat-app-f2d296.zapier.app/')

        const textBoxSelector =  'textarea[aria-label="chatbot-user-prompt"]';
        await page.waitForSelector(textBoxSelector);
        await page.type(textBoxSelector, prompt);

        await page.keyboard.press('Enter');

        await page.waitForSelector('[data-testid="final-bot-response"] p');

        var value = await page.$$eval('[data-testid="final-bot-response"]', async (elements) => {
            return elements.map((element) => element.textContent);
        });

        setTimeout(async () => {
            if (value.length == 0) return await interaction.editReply('There was an error. Please try again later.')
        }, 30000) //30000ms = 30s maximum puppeteer will wait.

        await browser.close();

        const maxLength = 2000;
        const stringValue = value.join('');
        const stringChunks = [];

        // We will split them if the text has >2000 chars so the bot won't get error.
        for (let i = 0; i < stringValue.length; i += maxLength) {
            const chunk = stringValue.substring(i, i + maxLength);
            stringChunks.push(chunk);
          }
          
          if (stringChunks.length > 0) {
            await interaction.editReply(stringChunks[0]);
          }

          for (let i = 1; i < stringChunks.length; i++) {
            await interaction.followUp(stringChunks[i]);
          }

    }
}
