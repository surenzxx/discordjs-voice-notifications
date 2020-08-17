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
        guild.members.forEach(async (member) => {
            let newUser = await User.upsert({
                clientId: member.id,
                joined: member.joinedAt,
                createdAt: member.user.createdAt,
                username: member.user.username
            });
        }
        );

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