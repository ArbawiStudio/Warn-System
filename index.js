const ServerExpress = require('express')
const Application = ServerExpress()
const { Client, Intents, MessageEmbed } = require('discord.js')
const TOBZiClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const db = require('quick.db')
const chalk = require('chalk')

var Config = {
    Token: "",
    Prefix: "",
    StaffRoleID: ""
}

TOBZiClient.on('ready', async() => {
    var TOBZi = console.log;
    TOBZi(chalk.yellowBright(`\n
┏━━━━━━━━━━━━━━━━━━━━┓
        TOBZi
┗━━━━━━━━━━━━━━━━━━━━┛`))
    TOBZi(chalk.redBright(`BOT is Ready : ${TOBZiClient.user.username} (ID: ${TOBZiClient.user.id})`))
    await TOBZiClient.user.setActivity(`${Config.Prefix}help`, { type: 'COMPETING' })
})

TOBZiClient.on('messageCreate', async TOBZiCoder => {
    if(TOBZiCoder.content.startsWith(Config.Prefix + 'help')) {
        const EMBED = new MessageEmbed()
           .setAuthor(TOBZiCoder.author.tag, TOBZiCoder.author.displayAvatarURL())
           .setThumbnail(TOBZiCoder.author.displayAvatarURL())
           .addField(`**${Config.Prefix}set-muterole <@Mute Role>**`, `Set a Mute Role`, true)
           .addField(`**${Config.Prefix}set-logchannel <#Channel>**`, `Set Log Channel`, true)
           .addField(`**${Config.Prefix}warn**`, `For Warn a Member`)
           .addField(`**${Config.Prefix}warns**`, `View the Warns of Member`, true)
           .addField(`**${Config.Prefix}delete-warns**`, `Delete All Warns from a User`, true)
           .setFooter(`Requested by ${TOBZiCoder.author.tag}`, TOBZiCoder.author.displayAvatarURL())
        TOBZiCoder.channel.send({ embeds: [EMBED] })
    } else if(TOBZiCoder.content.startsWith(Config.Prefix + 'set-muterole')) {
        if(!TOBZiCoder.member.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, You Don't Have any Permission to Use a Command!**`)] })
        if(!TOBZiCoder.guild.me.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, I Don't Have any Permission to Use a Command!**`)] })
        const Role = await TOBZiCoder.mentions.roles.first()
        if(!Role) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, Please Mention a Role!**`)] })
        db.set(`MuteRole_${TOBZiCoder.guild.id}`, Role.id)
        TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:white_check_mark: ${Role} is Mute Role Now!`)] })
    } else if(TOBZiCoder.content.startsWith(Config.Prefix + 'set-logchannel')) {
        if(!TOBZiCoder.member.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, You Don't Have any Permission to Use a Command!**`)] })
        if(!TOBZiCoder.guild.me.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, I Don't Have any Permission to Use a Command!**`)] })
        const Channel = await TOBZiCoder.mentions.channels.first()
        if(!Channel) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, Please Mention a Channel!**`)] })
        db.set(`LogChannel_${TOBZiCoder.guild.id}`, Channel.id)
        TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:white_check_mark: ${Channel} is Log Channel Now!`)] })
    } else if(TOBZiCoder.content.startsWith(Config.Prefix + 'warn')) {
        if(!TOBZiCoder.member.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, You Don't Have any Permission to Use a Command!**`)] })
        if(!TOBZiCoder.guild.me.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, I Don't Have any Permission to Use a Command!**`)] })
        const Role = await TOBZiCoder.guild.roles.cache.get(db.get(`MuteRole_${TOBZiCoder.guild.id}`))
        if(!Role) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, I Can't a Mute Role!**`)] })
        const User = await TOBZiCoder.mentions.users.first()
        if(!User) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, Please Mention a Member**`)] })
        const Reason = await TOBZiCoder.content.split(' ').slice(2).join(' ')
        if(!Reason) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, Please type a Reason/Why!**`)] })
        const Member = await TOBZiCoder.guild.members.cache.get(User.id)
        await Member.roles.add(Role)
        const W = await db.fetch(`Warn_${TOBZiCoder.guild.id}_${User.id}`)
        if(W === null) {
            db.add(`Warn_${TOBZiCoder.guild.id}_${User.id}`, 1)
        }
        TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:white_check_mark: ${User} has been Warned!`)] })
        const LOG = await TOBZiCoder.guild.channels.cache.get(db.get(`LogChannel_${TOBZiCoder.guild.id}`))
        if(!LOG) return;
        LOG.send({ embeds: [new MessageEmbed() .setAuthor(TOBZiCoder.author.tag, TOBZiCoder.author.displayAvatarURL()) .setThumbnail(TOBZiCoder.author.displayAvatarURL()) .setDescription(`${User} has been Warned by ${TOBZiCoder.author}`)] })
    } else if(TOBZiCoder.content.startsWith(Config.Prefix + 'show-warns')) {
        if(!TOBZiCoder.member.roles.cache.has(Config.StaffRoleID)) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, You Don't Have any Permission to Use a Command!**`)] })
        if(!TOBZiCoder.member.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, You Don't Have any Permission to Use a Command!**`)] })
        if(!TOBZiCoder.guild.me.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, I Don't Have any Permission to Use a Command!**`)] })
        const args = await TOBZiCoder.content.split(' ').slice(1).join(' ')
        const User = await TOBZiCoder.mentions.members.first() ||await TOBZiCoder.guild.members.cache.get(args[1])
        if(!User) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, Please Mention a Member**`)] })
        const Warns = await db.fetch(`Warn_${TOBZiCoder.guild.id}_${User.id}`)
        TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`**${User.user.username}'s** Make \`${Warns || '0'}\` Warn`)] })
    } else if(TOBZiCoder.content.startsWith(Config.Prefix + 'delete-warns')) {
        if(!TOBZiCoder.member.roles.cache.has(Config.StaffRoleID)) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, You Don't Have any Permission to Use a Command!**`)] })
        if(!TOBZiCoder.member.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, You Don't Have any Permission to Use a Command!**`)] })
        if(!TOBZiCoder.guild.me.permissions.has('ADMINISTRATOR')) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, I Don't Have any Permission to Use a Command!**`)] })
        const args = await TOBZiCoder.content.split(' ').slice(1).join(' ')
        const User = await TOBZiCoder.mentions.members.first() ||await TOBZiCoder.guild.members.cache.get(args[1])
        if(!User) return TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`:x: **${TOBZiCoder.author}, Please Mention a Member**`)] })
        db.delete(`Warn_${TOBZiCoder.guild.id}_${User.id}`)
        TOBZiCoder.channel.send({ embeds: [new MessageEmbed() .setDescription(`Done Remove all Warns`)] })
    }
})

TOBZiClient.on('guildMemberAdd', async Member => {
    const Role = await db.get(`MuteRole_${Member.guild.id}`)
    if(db.get(`Warn_${Member.guild.id}_${Member.id}`)) {
        Member.roles.add(Role)
    }
})

TOBZiClient.login(Config.Token)
