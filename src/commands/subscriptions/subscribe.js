const { RichEmbed } = require('discord.js');
const VoiceChannelSubscription = require('../../models/VoiceChannelSubscription');

module.exports = {
    run: async (client, message, args) => {
        // Get all voice channel objects.
        if(args.length === 0) {
            let embed = new RichEmbed()
                .setDescription("Please specify a voice channel id.")
                .setColor("#FF0E74");
            let msg = await message.channel.send(embed);
            return;
        }
        try {
            let voiceChannels = args
                .filter((id, index) => args.indexOf(id) === index)
                .map(id => client.channels.get(id))
                .filter((channel, i) => (channel !== undefined && channel.type === 'voice'));
            
            let success = [];
    
            for(let i = 0; i < voiceChannels.length; i++) {
                let voiceChannel = voiceChannels[i];
                let [ newSub, createdSub ] = await VoiceChannelSubscription.findOrCreate({
                    where: { channelId: voiceChannel.id, clientId: message.author.id },
                    defaults: {
                        channelId: voiceChannel.id,
                        guildId: message.guild.id,
                        clientId: message.author.id,
                        subscribed: true
                    }
                }).catch(err => console.log(err));
                if(!createdSub) {
                    await newSub.update({ subscribed: true }).catch(err => console.log(err));
                    console.log("Updated.");
                }
                success.push(voiceChannel.name);
            }
            let embed = new RichEmbed()
                .setDescription(`Success. You've been subscribed to **${success.join(", ")}**`)
                .setTimestamp()
                .setColor("#25FF07");
            let msg = await message.channel.send(embed);
        }
        catch(err) {
            console.log(err);
        }
    },
    aliases: new Map([
        ['sub', null]
    ])
}

function clear(fn, i) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Cleared.");
            resolve();
        }, i*1000);
    })
}
