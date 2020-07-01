const { RichEmbed } = require('discord.js');
const VoiceChannelSubscription = require('../../models/VoiceChannelSubscription');

module.exports = {
    run: async(client, message, args) => {
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
                let subscription = await VoiceChannelSubscription.findOne({
                    where: { channelId: voiceChannel.id, clientId: message.author.id }
                }).catch(err => console.log(err));
                await subscription.update({ subscribed: false }).catch(err => console.log(err));
                success.push(voiceChannel.name);
            }
            let embed = new RichEmbed()
                .setDescription(`Success. You've been unsubscribed from **${success.join(", ")}**`)
                .setTimestamp()
                .setColor("#25FF07");
            let msg = await message.channel.send(embed);  
        }
        catch(err) {
            console.log(err);
        }
    },
    aliases: new Map([
        ['unsub']
    ])
}
