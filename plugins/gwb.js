const fs = require('fs');
const { cmd } = require('../command');
const sensitiveData = require('../dila_md_licence/a/b/c/d/dddamsbs');
const welcomeGroupsFile = './welcomeGroups.json'; // Path to the JSON file

// Function to load enabled groups from the JSON file
const loadEnabledGroups = () => {
    if (!fs.existsSync(welcomeGroupsFile)) {
        fs.writeFileSync(welcomeGroupsFile, JSON.stringify({ enabledGroups: [], privateWelcomeEnabled: false })); // Create file if it doesn't exist
    }
    const data = fs.readFileSync(welcomeGroupsFile);
    return JSON.parse(data);
};

// Function to save enabled groups to the JSON file
const saveEnabledGroups = (data) => {
    fs.writeFileSync(welcomeGroupsFile, JSON.stringify(data));
};

// Function to check if a group is enabled for welcome messages
const isGroupEnabled = (groupId) => {
    const { enabledGroups } = loadEnabledGroups();
    return enabledGroups.includes(groupId);
};

// Function to add a group to the enabled list
const addGroup = (groupId) => {
    const data = loadEnabledGroups();
    if (!data.enabledGroups.includes(groupId)) {
        data.enabledGroups.push(groupId);
        saveEnabledGroups(data);
    }
};

// Function to remove a group from the enabled list
const removeGroup = (groupId) => {
    const data = loadEnabledGroups();
    if (data.enabledGroups.includes(groupId)) {
        const updatedGroups = data.enabledGroups.filter(id => id !== groupId);
        data.enabledGroups = updatedGroups;
        saveEnabledGroups(data);
    }
};

// Function to check if private welcome messages are enabled
const arePrivateWelcomeEnabled = () => {
    const { privateWelcomeEnabled } = loadEnabledGroups();
    return privateWelcomeEnabled;
};

// Function to set the private welcome messages enabled status
const setPrivateWelcomeEnabled = (status) => {
    const data = loadEnabledGroups();
    data.privateWelcomeEnabled = status;
    saveEnabledGroups(data);
};

// Function to send welcome message to new members in group
const sendGroupWelcomeMessage = async (conn, groupId, participants, groupName) => {
    const mentions = participants.map(participant => participant.split('@')[0]);
    const welcomeMessage = `𝗛𝗲𝘆 ${mentions.join(', ')} 👋\n𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 *${groupName}* 🎉\nˢᵉᵊ ᵍʳᵒᵘᵖ ᵈᵉˢᶜʳⁱᵗⁱᵒⁿ\n\nᴍᴀᴅᴇ ʙʸ ᴍʳ ᴅɪʟᴀ ᴏꜰᴄ`;

    await conn.sendMessage(groupId, {
        text: welcomeMessage,
        mentions: participants
    });
};

// Function to send a private welcome message to each new member
const sendPrivateWelcomeMessage = async (conn, memberId, groupName) => {
    const pushname = memberId.split('@')[0];
    const welcomeMessage = `𝗛𝗲𝘆 ${pushname} 👋\n𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 *${groupName}* 🎉\nˢᵊ ᵍʳᵒᵘᵖ ᵈᵉˢᶜʳⁱᵖᵗⁱᵒⁿ\n\nᴍᴀᴅᴇ ʙʸ ᴍʳ ᴅɪʟᴀ ᴏꜰᴄ`;

    await conn.sendMessage(memberId, {
        text: welcomeMessage
    });
};

// Event listener for new group participants
const registerGroupWelcomeListener = (conn) => {
    conn.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        if (action === 'add' && isGroupEnabled(id)) { // Check if the group is enabled
            const groupMetadata = await conn.groupMetadata(id);
            const groupName = groupMetadata.subject;

            // Send group welcome message
            await sendGroupWelcomeMessage(conn, id, participants, groupName);

            // Send private welcome messages if enabled
            if (arePrivateWelcomeEnabled()) {
                for (const participant of participants) {
                    await sendPrivateWelcomeMessage(conn, participant, groupName);
                }
            }
        }
    });
};

// Command to toggle welcome messages and private welcome messages
cmd({
    pattern: "welcome (on|off|alleton|alletoff|list)",
    react: "👋",
    desc: "Enable or disable group welcome messages and private welcome messages",
    category: "group",
    use: '.welcome (on|off|alleton|alletoff|list)',
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply('This command can only be used in a group. 🚫');
        if (!isBotAdmins) return reply('Bot must be an admin to use this command. 🤖');
        if (!isAdmins) return reply('Only admins can use this command. 👮‍♂️');

        const option = args[0]; // Get the option

        switch (option) {
            case 'on':
                addGroup(from); // Add the group ID to the enabled list
                registerGroupWelcomeListener(conn); // Register listener if not already registered
                reply('Welcome messages are now enabled for this group! 🥳');
                break;

            case 'off':
                removeGroup(from); // Remove the group ID from the enabled list
                reply('Welcome messages are now disabled for this group! ❌');
                break;

            case 'alleton':
                setPrivateWelcomeEnabled(true); // Enable private welcome messages
                reply('Private welcome messages are now enabled! 🎉');
                break;

            case 'alletoff':
                setPrivateWelcomeEnabled(false); // Disable private welcome messages
                reply('Private welcome messages are now disabled! ❌');
                break;

            case 'list':
                const { enabledGroups } = loadEnabledGroups();
                if (enabledGroups.length === 0) {
                    return reply('No groups have welcome messages enabled. 🚫');
                }
                reply(`Enabled groups:\n${enabledGroups.join('\n')}`);
                break;

            default:
                return reply('Invalid option. Use "on", "off", "alleton", "alletoff", or "list".');
        }
    } catch (e) {
        reply('Error processing your request. ⚠️');
        console.log('Error processing welcome command:', e);
    }
});
