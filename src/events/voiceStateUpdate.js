const VoiceChannelSubscription = require('../models/VoiceChannelSubscription');
const User = require('../models/User');
const Whitelist = require('../models/Whitelist');
const { Op } = require('sequelize');
const { RichEmbed } = require('discord.js');

module.exports = async(client, oldMember, newMember) => {
    // If member joins voice channel.
    if (!oldMember.voiceChannel && newMember.voiceChannel && newMember.guild.name == "Dune") {
        console.log(newMember.user.username + " joined. ");
        const timeStamp = Date.now();
        
        //Adds users to the database
        let newUser = await User.findOrCreate({
            where: {
                clientId: newMember.user.id
            },
            defaults: {
                clientId: newMember.user.id,
                joined: newMember.guild.joinedTimestamp,
                createdAt: newMember.user.createdAt,
                username: newMember.user.username,
                lastJoinedTime: timeStamp,
                lastVoiceChannel: newMember.voiceChannel.id
            }
        });
        
        //Date object thats 5 minutes in the past
        var dt = new Date();
        dt.setMinutes(dt.getMinutes() - 5);

        //Create object if user joined the same voice channel within 5 minutes
        let userJoin = await User.findAll({
                attributes: ['clientId', 'lastVoiceChannel', 'lastJoinedTime'],
                where: {
                    clientId: newMember.id,
                    lastJoinedTime: {
                        [Op.gt]: dt      //if the lastJoinedTime is older than 5 minutes
                    },
                    lastVoiceChannel: newMember.voiceChannel.id
                }
            })

        //If userJoin does not exist, then update user lastJoinedTime and lastVoiceChannel
        if (!Array.isArray(userJoin) || !userJoin.length) {
            User.update({
                lastJoinedTime: timeStamp,
                lastVoiceChannel: newMember.voiceChannel.id
            }, {
                where: {
                    clientId: newMember.user.id
                }
            });
        }

        //If userJoin does exist then stop running code
        if (Array.isArray(userJoin) && userJoin.length == 1) {
            console.log(newMember.user.username + " has re-connected");
            return;
        }

        try {
            // Select all users who are subscribed to this channel.
            let subscriptionIds = await VoiceChannelSubscription.findAll({
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
                    // let invite = await newMember.voiceChannel.createInvite();
                    // inviteLink = "https://discord.gg/" + invite.code;
                    // const bruh = new Date().toISOString().match(/(\d{2}:){2}\d{2}/)[0];
                    embed = new RichEmbed()
                        .setTitle(`${newMember.displayName} joined ${newMember.voiceChannel.name} in ${newMember.guild.name}`)
                        // .setDescription(inviteLink)
                        .setAuthor(newMember.user.username, newMember.user.displayAvatarURL)
                        .setColor("#298DEC")
                        .setTimestamp(timeStamp);
                    // Find member by ID
                    let member = newMember.guild.members.find(m => m.id === subscriptionIds[i]);
		    //console.log(member.voiceChannel) 
            //if member exists and is not in voiceChannel in current Guild
                    if (member && typeof member.voiceChannel === "undefined"){
                        console.log(member.displayName + " got notified about " + newMember.displayName);
                        member.user.send(embed);
                    } else console.log("Member not found..");
                } else {
                    console.log("Whitelist is not empty");
                    //console.log(whitelist);
                    if (whitelist.find(id => id === newMember.id) && newMember.user.bot == false) {
                        // Send message.
                        // let invite = await newMember.voiceChannel.createInvite();
                        // inviteLink = "https://discord.gg/" + invite.code;
                        embed = new RichEmbed()
                            .setTitle(`${newMember.displayName} joined ${newMember.voiceChannel.name} in ${newMember.guild.name}`)
                            // .setDescription(inviteLink)
                            .setAuthor(newMember.user.username, newMember.user.displayAvatarURL)
                            .setColor("#298DEC")
                            .setTimestamp();
                        let member = newMember.guild.members.find(m => m.id === subscriptionIds[i]);
			//console.log(member.voiceChannel)
		       //if member exists and is not in voiceChannel in current Guild
                        if (member && typeof member.voiceChannel === "undefined"){
                            console.log(member.displayName + " got notified about " + newMember.displayName);
                            member.user.send(embed);
                        } else console.log("Member not found..");
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
            console.log(newMember.user.username + " deafened/muted")
        } else if ((oldMember.deaf && !newMember.deaf) || (oldMember.mute && !newMember.mute)) {
            console.log(newMember.user.username + " un-deafened/un-muted")
        } else {
            console.log(newMember.user.username + " has switched voice channels.");
        }
    } else if (oldMember.voiceChannel && !newMember.voiceChannel) {
        console.log(newMember.user.username + " has left the voice channel.");
    }
}