const { cmd } = require('../command');const sensitiveData = require('../dila_md_licence/a/b/c/d/dddamsbs');const fs = require('fs'); const WelcomeSettings = {    welcomeEnabled: false,     welcomeAlertEnabled: false,    welcomeMessages: {},     listenerRegistered: false, };const loadWelcomeMessages = () => {    if (fs.existsSync('./data/welcomeMessages.json')) {        WelcomeSettings.welcomeMessages = JSON.parse(fs.readFileSync('./data/welcomeMessages.json'));    } else {        WelcomeSettings.welcomeMessages = {};    }};const saveWelcomeMessages = () => {    fs.writeFileSync('./data/welcomeMessages.json', JSON.stringify(WelcomeSettings.welcomeMessages, null, 2));}; const sendWelcomeMessage = async (conn, groupId, participants) => {    const groupMetadata = await conn.groupMetadata(groupId);     const groupName = groupMetadata.subject;     const mentions = participants.map(participant => participant);    const welcomeText = WelcomeSettings.welcomeMessages[groupId] ? WelcomeSettings.welcomeMessages[groupId] : 'Welcome to the group!';     const welcomeMessage = `𝗛𝗲𝘆 ♥️🫂\n${mentions.map(memberId => `@${memberId.split('@')[0]}`).join('\n')}\n𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 *${groupName}* 🎉\nˢᵉᵉ ᵍʳᵒᵘᵖ ᵈᵉˢᶜʳⁱᵖᵗⁱᵒⁿ\n\n${sensitiveData.footerText}`;    await conn.sendMessage(groupId, { text: welcomeMessage, mentions });};const sendPrivateWelcomeAlert = async (conn, groupId, memberId) => {    const groupMetadata = await conn.groupMetadata(groupId);     const groupName = groupMetadata.subject;     const groupDescription = groupMetadata.desc || 'No description available';     const privateAlertMessage = `𝗛𝗲𝘆 @${memberId.split('@')[0]},\n𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 *${groupName}* 🎉\n𝗥𝗲𝗮𝗱 𝘁𝗵𝗶𝘀 : ${groupDescription}\n${sensitiveData.footerText}`;    await conn.sendMessage(memberId, { text: privateAlertMessage, mentions: [memberId] });};const registerGroupWelcomeListener = (conn) => {    if (WelcomeSettings.listenerRegistered) return;     WelcomeSettings.listenerRegistered = true;     conn.ev.on('group-participants.update', async (update) => {        const { id, participants, action } = update;         if (action === 'add') {             if (WelcomeSettings.welcomeEnabled) await sendWelcomeMessage(conn, id, participants);             if (WelcomeSettings.welcomeAlertEnabled) {                 participants.forEach(async (participant) => {                    await sendPrivateWelcomeAlert(conn, id, participant);                });            }       }   });};cmd({ pattern: "welcomeon", react: "🎉", desc: "Enable welcome messages for new group members", category: "group", use: '.welcomeon', filename: __filename },async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {    try {        if (!isGroup) return reply('This command can only be used in a group. 🚫');       if (!isBotAdmins) return reply('Bot must be an admin to use this command. 🤖');       if (!isAdmins) return reply('Only admins can use this command. 👮‍♂️');       WelcomeSettings.welcomeEnabled = true;        registerGroupWelcomeListener(conn);         reply('Group welcome messages have been enabled! 🎉');    } catch (e) {        reply('Error enabling welcome messages. ⚠️');        console.log(e);    }}); cmd({ pattern: "welcomeoff", react: "❌", desc: "Disable welcome messages for new group members", category: "group", use: '.welcomeoff', filename: __filename },async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {    try {        if (!isGroup) return reply('This command can only be used in a group. 🚫');        if (!isBotAdmins) return reply('Bot must be an admin to use this command. 🤖');        if (!isAdmins) return reply('Only admins can use this command. 👮‍♂️');        WelcomeSettings.welcomeEnabled = false;        reply('Group welcome messages have been disabled! ❌');    } catch (e) {        reply('Error disabling welcome messages. ⚠️');       console.log(e);   }});cmd({ pattern: "welcomealerton", react: "🔔", desc: "Enable welcome alerts for new group members", category: "group", use: '.welcomealerton', filename: __filename },async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {    try {        if (!isGroup) return reply('This command can only be used in a group. 🚫');       if (!isBotAdmins) return reply('Bot must be an admin to use this command. 🤖');        if (!isAdmins) return reply('Only admins can use this command. 👮‍♂️');        WelcomeSettings.welcomeAlertEnabled = true;         registerGroupWelcomeListener(conn);         reply('Private welcome alerts have been enabled! 🔔');    } catch (e) {        reply('Error enabling welcome alerts. ⚠️');        console.log(e);   }});cmd({ pattern: "welcomealertoff", react: "🔕", desc: "Disable welcome alerts for new group members", category: "group", use: '.welcomealertoff', filename: __filename },async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {    try {    if (!isGroup) return reply('This command can only be used in a group. 🚫');    if (!isBotAdmins) return reply('Bot must be an admin to use this command. 🤖');     if (!isAdmins) return reply('Only admins can use this command. 👮‍♂️');    WelcomeSettings.welcomeAlertEnabled = false;     reply('Private welcome alerts have been disabled! 🔕');   } catch (e) {     reply('Error disabling welcome alerts. ⚠️');    console.log(e);  }});cmd({    pattern: "welcomemsg (.+)",    react: "✍️",    desc: "Set a custom welcome message for the group",    category: "group",    use: '.welcomemsg {TEXT}',    filename: __filename}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {    try {    if (!isGroup) return reply('This command can only be used in a group. 🚫');     if (!isBotAdmins) return reply('Bot must be an admin to use this command. 🤖');    if (!isAdmins) return reply('Only admins can use this command. 👮‍♂️');       const message = m.message.replace(/\.welcomemsg /, '').trim();  if (!message) return reply('Please provide a welcome message.');    WelcomeSettings.welcomeMessages[from] = message;     saveWelcomeMessages();     reply(`Custom welcome message set! 🎉\n\n${message}`);    } catch (error) {   reply('Error setting custom welcome message. ⚠️');   console.log(error);  }});cmd({ pattern: "welcomedel", react: "🗑️", desc: "Delete the custom welcome message for the group",
