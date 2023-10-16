const { Client, IntentsBitField, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
require('dotenv').config()

const token = process.env['TOKEN'];
const clientId = process.env['CLIENT_ID'];
const guildId = process.env['GUILD_ID'];

const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


// Importing the commands files in the "commands" folder
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
      console.log('Started refreshing application (/) commands.');
  
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
})();

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    const { commandName } = interaction;
  
    if (!client.commands.has(commandName)) return;
  
    try {
      await client.commands.get(commandName).execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Mager ngejawab pertanyaanmu', ephemeral: true });
    }
  });
  
client.login(token);