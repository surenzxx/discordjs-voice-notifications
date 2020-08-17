const User = require('../models/User');
const Guild = require('../models/Guild');

/**
 * Add user to Users table
 * Add guild to Guild table
 * Add user and guild ids to UserGuild table.
 */
module.exports = async (client, guild) => {
    console.log("Bot joined a guild.");
    try {
        for (member in guild.members) {
            let newUser = await User.findOrCreate({
                where: {
                    clientId: member.id
                },
                defaults: {
                    clientId: member.id,
                    joined: member.joinedAt,
                    createdAt: member.user.createdAt,
                    username: member.user.username
                }
            });

            let newUserGuild = await UserGuilds.findOrCreate({
                where: {
                    guildId: member.guild.id,
                    clientId: member.id
                },
                defaults: {
                    guildId: member.guild.id,
                    clientId: member.id
                }
            });

        }
        let newGuild = await Guild.findOrCreate({
            where: {
                guildId: guild.id
            },
            defaults: {
                guildId: guild.id,
                guildName: guild.name,
                guildCreateDate: guild.createdAt
            }
        });

        console.log("Good.");
    } catch (err) {
        console.log(err);
    }
}