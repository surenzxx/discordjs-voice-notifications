const Subscription = require('../models/VoiceChannelSubscription');
const Whitelist = require('../models/Whitelist');
const {
    RichEmbed
} = require('discord.js');

module.exports = async(client, oldMember, newMember) => {
    // If member joins voice channel.
    if (!oldMember.voiceChannel && newMember.voiceChannel) {
        console.log(newMember.user.username + " joined.");
        try {
            // Select all users who are subscribed to this channel.
            let subscriptionIds = await Subscription.findAll({
                    attributes: ['clientId'],
                    where: {
                        channelId: newMember.voiceChannel.id,
                        subscribed: true
                    }
                }).map(subscription => subscription.dataValues.clientId)
                .filter(id => id !== newMember.id);
            // console.log(subscriptionIds);
            // Iterate through the IDs of each user who subscribed to channel.
            // For each person subscribed to the channel, we need to get their whitelist.
            // We check if the member who joined is in their whitelist.
            for (let i = 0; i < subscriptionIds.length; i++) {
                let whitelist = await Whitelist.findAll({
                    attributes: ['whitelistedUserId'],
                    where: {
                        channelId: newMember.voiceChannel.id,
                        clientId: subscriptionIds[i],
                        whitelisted: true
                    }
                }).map(wl => wl.dataValues.whitelistedUserId);
                if (whitelist.length === 0 && newMember.user.bot == false) { // If whitelist is empty, send them a message
                    let invite = await newMember.voiceChannel.createInvite();
                    inviteLink = "https://discord.gg/" + invite.code;
                    embed = new RichEmbed()
                        .setTitle(`${newMember.displayName} joined ${newMember.voiceChannel.name} in ${newMember.guild.name}`)
                        .setDescription(inviteLink)
                        .setAuthor(newMember.user.username, newMember.user.displayAvatarURL)
                        .setColor("#298DEC")
                        .setTimestamp();
                    // Find member by ID
                    let member = newMember.guild.members.find(m => m.id === subscriptionIds[i]);
		    //console.log(member.voiceChannel) 
		    //if member exists and is not in voiceChannel in current Guild
                    if (member && typeof member.voiceChannel === "undefined") 
                        member.user.send(embed);
                    else console.log("Member not found..");
                } else {
                    console.log("Whitelist is not empty");
                    //console.log(whitelist);
                    if (whitelist.find(id => id === newMember.id) && newMember.user.bot == false) {
                        // Send message.
                        let invite = await newMember.voiceChannel.createInvite();
                        inviteLink = "https://discord.gg/" + invite.code;
                        embed = new RichEmbed()
                            .setTitle(`${newMember.displayName} joined ${newMember.voiceChannel.name} in ${newMember.guild.name}`)
                            .setDescription(inviteLink)
                            .setAuthor(newMember.user.username, newMember.user.displayAvatarURL)
                            .setColor("#298DEC")
                            .setTimestamp();
                        let member = newMember.guild.members.find(m => m.id === subscriptionIds[i]);
			//console.log(member.voiceChannel)
		       //if member exists and is not in voiceChannel in current Guild
                        if (member && typeof member.voiceChannel === "undefined")
                            member.user.send(embed);
                        else console.log("Member not found..");
                    } else {
                        console.log("User not in whitelist.");
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    } else if (oldMember.voiceChannel && newMember.voiceChannel) {
        if ((!oldMember.deaf && newMember.deaf) || (!oldMember.mute && newMember.mute)) {
            console.log(newMember.user.username + " deafened")
        } else if ((oldMember.deaf && !newMember.deaf) || (oldMember.mute && !newMember.mute)) {
            console.log(newMember.user.username + " un-deafened")
        } else {
            console.log(newMember.user.username + " has switched voice channels.");
        }
    } else if (oldMember.voiceChannel && !newMember.voiceChannel) {
        console.log(newMember.user.username + " has left the voice channel.");
    }
}
