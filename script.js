// ======================================================
// AI TA'LIM — SCRIPT.JS
// ======================================================

// ------------------------------
// LOCAL STORAGE
// ------------------------------

const CHATS_KEY = "ai_talim_chats";
const ACTIVE_CHAT_KEY = "ai_talim_active_chat";
const DARK_MODE_KEY = "ai_talim_dark_mode";
const MUTE_KEY = "ai_talim_mute";
const VOICE_KEY = "ai_talim_voice";


// ------------------------------
// ELEMENTLAR
// ------------------------------

const chatContainer = document.getElementById("chat-container");
const chatList = document.getElementById("chat-list");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const voiceGender = document.getElementById("voice-gender");
const muteText = document.getElementById("mute-text");


// ------------------------------
// CHATLAR
// ------------------------------

let chats = loadChats();

let activeChatId = localStorage.getItem(ACTIVE_CHAT_KEY);


// Agar chatlar bo'lmasa
if (!Array.isArray(chats) || chats.length === 0) {

    const firstChat = createChatObject();

    chats = [firstChat];

    activeChatId = firstChat.id;

    saveChats();

    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        activeChatId
    );
}


// Agar active chat noto'g'ri bo'lsa
if (!getActiveChat()) {

    activeChatId = chats[0].id;

    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        activeChatId
    );
}


// ------------------------------
// BOSHLANG'ICH SOZLAMALAR
// ------------------------------

let muted =
    localStorage.getItem(MUTE_KEY) === "true";

let selectedVoice =
    localStorage.getItem(VOICE_KEY) || "female";


// ------------------------------
// ISHGA TUSHIRISH
// ------------------------------

applyDarkMode();
updateMuteButton();

if (voiceGender) {
    voiceGender.value = selectedVoice;
}

renderChatList();
renderActiveChat();


// ======================================================
// CHAT OBJECT
// ======================================================

function createChatObject() {

    return {
        id:
            "chat_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        title: "Yangi suhbat",

        pinned: false,

        messages: [
            {
                role: "assistant",

                text:
                    "Salom! 👋 Men AI Ta’lim. Menga istalgan savolingni berishing mumkin."
            }
        ]
    };
}


// ======================================================
// LOCAL STORAGE
// ======================================================

function loadChats() {

    try {

        const saved =
            localStorage.getItem(CHATS_KEY);

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;

    } catch (error) {

        console.error(
            "Chatlarni yuklashda xato:",
            error
        );

        return [];
    }
}


function saveChats() {

    localStorage.setItem(
        CHATS_KEY,
        JSON.stringify(chats)
    );
}


// ======================================================
// ACTIVE CHAT
// ======================================================

function getActiveChat() {

    return chats.find(function(chat) {

        return chat.id === activeChatId;

    });
}


// ======================================================
// CHAT LIST
// ======================================================

function renderChatList() {

    if (!chatList) {
        return;
    }

    chatList.innerHTML = "";


    if (chats.length === 0) {

        chatList.innerHTML =
            '<div class="empty-chats">Hozircha chatlar yo‘q</div>';

        return;
    }


    // Pinned chatlar tepada
    const sortedChats =
        chats.slice().sort(function(a, b) {

            if (a.pinned && !b.pinned) {
                return -1;
            }

            if (!a.pinned && b.pinned) {
                return 1;
            }

            return 0;
        });


    sortedChats.forEach(function(chat) {

        const item =
            document.createElement("div");

        item.className = "chat-item";


        if (chat.id === activeChatId) {
            item.classList.add("active");
        }


        // Chat ochish
        const openButton =
            document.createElement("button");

        openButton.className = "chat-open";

        openButton.type = "button";

        openButton.title = chat.title;

        openButton.textContent =
            (chat.pinned ? "📌 " : "") +
            chat.title;


        openButton.onclick = function() {

            switchChat(chat.id);

        };


        // Pin
        const pinButton =
            document.createElement("button");

        pinButton.className = "chat-pin";

        pinButton.type = "button";

        pinButton.title =
            chat.pinned
                ? "Pinni olib tashlash"
                : "Chatni pin qilish";

        pinButton.textContent =
            chat.pinned ? "📌" : "📍";


        pinButton.onclick = function(event) {

            event.stopPropagation();

            pinChat(chat.id);

        };


        // Delete
        const deleteButton =
            document.createElement("button");

        deleteButton.className = "chat-delete";

        deleteButton.type = "button";

        deleteButton.title = "Chatni o‘chirish";

        deleteButton.textContent = "🗑️";


        deleteButton.onclick = function(event) {

            event.stopPropagation();

            deleteChat(chat.id);

        };


        item.appendChild(openButton);

        item.appendChild(pinButton);

        item.appendChild(deleteButton);

        chatList.appendChild(item);

    });
}


// ======================================================
// CHATNI OCHISH
// ======================================================

function switchChat(id) {

    const chat =
        chats.find(function(item) {

            return item.id === id;

        });


    if (!chat) {
        return;
    }


    activeChatId = id;

    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        activeChatId
    );


    renderChatList();

    renderActiveChat();
}


// ======================================================
// CHATNI YANGI QILISH
// ======================================================

function newChat() {

    const newChatObject =
        createChatObject();


    chats.unshift(
        newChatObject
    );


    activeChatId =
        newChatObject.id;


    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        activeChatId
    );


    saveChats();

    renderChatList();

    renderActiveChat();


    if (userInput) {

        userInput.value = "";

        userInput.focus();

    }
}


// ======================================================
// CHATNI TOZALASH
// ======================================================

function clearCurrentChat() {

    const chat =
        getActiveChat();


    if (!chat) {
        return;
    }


    chat.messages = [
        {
            role: "assistant",

            text:
                "Salom! 👋 Men AI Ta’lim. Menga istalgan savolingni berishing mumkin."
        }
    ];


    chat.title = "Yangi suhbat";


    saveChats();

    renderChatList();

    renderActiveChat();


    if (userInput) {
        userInput.focus();
    }
}


// ======================================================
// CHATNI O'CHIRISH
// ======================================================

function deleteChat(id) {

    const index =
        chats.findIndex(function(chat) {

            return chat.id === id;

        });


    if (index === -1) {
        return;
    }


    chats.splice(
        index,
        1
    );


    // Hamma chat o'chib qolsa
    if (chats.length === 0) {

        const newChatObject =
            createChatObject();

        chats.push(
            newChatObject
        );

        activeChatId =
            newChatObject.id;

    }


    // Aktiv chat o'chirilgan bo'lsa
    else if (
        !chats.some(function(chat) {
            return chat.id === activeChatId;
        })
    ) {

        activeChatId =
            chats[0].id;
    }


    localStorage.setItem(
        ACTIVE_CHAT_KEY,
        activeChatId
    );


    saveChats();

    renderChatList();

    renderActiveChat();
}


// ======================================================
// PIN / UNPIN
// ======================================================

function pinChat(id) {

    const chat =
        chats.find(function(item) {

            return item.id === id;

        });


    if (!chat) {
        return;
    }


    chat.pinned =
        !chat.pinned;


    saveChats();

    renderChatList();
}


// ======================================================
// CHATNI EKRANGA CHIQARISH
// ======================================================

function renderActiveChat() {

    if (!chatContainer) {
        return;
    }


    const chat =
        getActiveChat();


    if (!chat) {
        return;
    }


    chatContainer.innerHTML = "";


    chat.messages.forEach(function(message) {

        addMessageToScreen(
            message.role,
            message.text,
            false
        );

    });


    scrollChatToBottom();
}


// ======================================================
// MESSAGE EKRANGA QO'SHISH
// ======================================================

function addMessageToScreen(
    role,
    text,
    scroll
) {

    const message =
        document.createElement("div");


    message.className =
        "message " +
        (
            role === "user"
                ? "user-message"
                : "assistant-message"
        );


    // Avatar
    const avatar =
        document.createElement("div");

    avatar.className = "avatar";


    if (role === "assistant") {

        const img =
            document.createElement("img");

        img.src =
            "ai-talim-logo.png";

        img.alt =
            "AI Ta’lim";

        avatar.appendChild(img);

    } else {

        avatar.textContent = "👤";

    }


    // Content
    const content =
        document.createElement("div");

    content.className =
        "message-content";


    // Name
    const name =
        document.createElement("div");

    name.className =
        "message-name";

    name.textContent =
        role === "user"
            ? "Siz"
            : "AI Ta’lim";


    // Bubble
    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble";

    bubble.textContent =
        text;


    content.appendChild(name);

    content.appendChild(bubble);

    message.appendChild(avatar);

    message.appendChild(content);

    chatContainer.appendChild(message);


    if (scroll) {
        scrollChatToBottom();
    }
}


// ======================================================
// LOADING
// ======================================================

function showTyping() {

    const message =
        document.createElement("div");

    message.className =
        "message assistant-message";

    message.id =
        "typing-message";


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";


    const img =
        document.createElement("img");

    img.src =
        "ai-talim-logo.png";

    img.alt =
        "AI Ta’lim";


    avatar.appendChild(img);


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const name =
        document.createElement("div");

    name.className =
        "message-name";

    name.textContent =
        "AI Ta’lim";


    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble";


    const typing =
        document.createElement("div");

    typing.className =
        "typing";


    typing.innerHTML =
        "<span></span><span></span><span></span>";


    bubble.appendChild(typing);

    content.appendChild(name);

    content.appendChild(bubble);

    message.appendChild(avatar);

    message.appendChild(content);

    chatContainer.appendChild(message);


    scrollChatToBottom();
}


function removeTyping() {

    const typingMessage =
        document.getElementById(
            "typing-message"
        );


    if (typingMessage) {

        typingMessage.remove();

    }
}


// ======================================================
// CHATNI PASTGA TUSHIRISH
// ======================================================

function scrollChatToBottom() {

    if (!chatContainer) {
        return;
    }


    setTimeout(function() {

        chatContainer.scrollTop =
            chatContainer.scrollHeight;

    }, 30);
}


// ======================================================
// XABAR YUBORISH
// ======================================================

async function sendMessage() {

    if (!userInput) {
        return;
    }


    const message =
        userInput.value.trim();


    if (!message) {
        return;
    }


    const chat =
        getActiveChat();


    if (!chat) {
        return;
    }


    // Foydalanuvchi xabari
    chat.messages.push({

        role: "user",

        text: message

    });


    // Birinchi savoldan title yasash
    const userMessages =
        chat.messages.filter(function(item) {

            return item.role === "user";

        });


    if (
        userMessages.length === 1 &&
        chat.title === "Yangi suhbat"
    ) {

        let title =
            message
                .replace(/\s+/g, " ")
                .trim();


        if (title.length > 28) {

            title =
                title.substring(0, 28) +
                "...";

        }


        chat.title =
            title || "Yangi suhbat";

    }


    saveChats();

    renderChatList();


    // Ekranga chiqarish
    addMessageToScreen(
        "user",
        message,
        true
    );


    userInput.value = "";

    autoResizeTextarea();


    sendBtn.disabled = true;


    showTyping();


    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message:
                                message,

                            conversationId:
                                activeChatId
                        })
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            data = null;

        }


        if (!response.ok) {

            throw new Error(
                data &&
                data.error
                    ? data.error
                    : "Server xatosi: " +
                      response.status
            );
        }


        if (
            !data ||
            !data.reply
        ) {

            throw new Error(
                "AI javob qaytarmadi."
            );
        }


        removeTyping();


        chat.messages.push({

            role: "assistant",

            text: data.reply

        });


        saveChats();


        addMessageToScreen(
            "assistant",
            data.reply,
            true
        );


        speakText(
            data.reply
        );


    } catch (error) {

        console.error(
            "CHAT XATOSI:",
            error
        );


        removeTyping();


        const errorText =
            "❌ Xatolik yuz berdi: " +
            (
                error.message ||
                "Server bilan bog‘lanib bo‘lmadi."
            );


        chat.messages.push({

            role: "assistant",

            text: errorText

        });


        saveChats();


        addMessageToScreen(
            "assistant",
            errorText,
            true
        );

    } finally {

        sendBtn.disabled = false;

        userInput.focus();

    }
}


// ======================================================
// TEZKOR FAN SAVOLLARI
// ======================================================

function sendFastQuery(subject) {

    if (!userInput) {
        return;
    }


    userInput.value =
        subject +
        " fanidan menga yordam ber.";


    autoResizeTextarea();

    userInput.focus();

    sendMessage();
}


// ======================================================
// ENTER YUBORISH
// ======================================================

if (userInput) {

    userInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    userInput.addEventListener(
        "input",
        autoResizeTextarea
    );
}


// ======================================================
// TEXTAREA AVTO BALANDLIK
// ======================================================

function autoResizeTextarea() {

    if (!userInput) {
        return;
    }


    userInput.style.height =
        "auto";


    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            130
        ) + "px";
}


// ======================================================
// DARK MODE
// ======================================================

function toggleDarkMode() {

    const enabled =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        DARK_MODE_KEY,
        enabled ? "true" : "false"
    );
}


function applyDarkMode() {

    const enabled =
        localStorage.getItem(
            DARK_MODE_KEY
        ) === "true";


    if (enabled) {

        document.body.classList.add(
            "dark"
        );

    } else {

        document.body.classList.remove(
            "dark"
        );

    }
}


// ======================================================
// OVOZNI YOQISH / O'CHIRISH
// ======================================================

function toggleMute() {

    muted =
        !muted;


    localStorage.setItem(
        MUTE_KEY,
        muted ? "true" : "false"
    );


    if (muted) {

        window.speechSynthesis.cancel();

    }


    updateMuteButton();
}


function updateMuteButton() {

    if (!muteText) {
        return;
    }


    if (muted) {

        muteText.textContent =
            "Ovoz o‘chirilgan";

    } else {

        muteText.textContent =
            "Ovoz yoqilgan";

    }
}


// ======================================================
// OVOZ JINSI
// ======================================================

if (voiceGender) {

    voiceGender.addEventListener(
        "change",
        function() {

            selectedVoice =
                voiceGender.value;


            localStorage.setItem(
                VOICE_KEY,
                selectedVoice
            );

        }
    );
}


// ======================================================
// AI JAVOBINI O'QISH
// ======================================================

function speakText(text) {

    if (muted) {
        return;
    }


    if (
        !window.speechSynthesis
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const cleanText =
        text
            .replace(
                /[*_#`]/g,
                ""
            )
            .trim();


    if (!cleanText) {
        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    utterance.lang =
        "uz-UZ";


    utterance.rate =
        0.95;


    utterance.pitch =
        selectedVoice === "female"
            ? 1.15
            : 0.85;


    const voices =
        window.speechSynthesis
            .getVoices();


    if (voices.length > 0) {

        let uzVoice =
            voices.find(function(voice) {

                return voice.lang
                    .toLowerCase()
                    .startsWith("uz");

            });


        if (!uzVoice) {

            uzVoice =
                voices.find(function(voice) {

                    return voice.lang
                        .toLowerCase()
                        .startsWith("tr");

                });

        }


        if (uzVoice) {

            utterance.voice =
                uzVoice;

        }

    }


    window.speechSynthesis.speak(
        utterance
    );
}


// Brauzer ovozlarini oldindan yuklash
if (
    window.speechSynthesis
) {

    window.speechSynthesis
        .getVoices();

}


// ======================================================
// GLOBAL FUNKSIYALAR
// ======================================================

window.newChat =
    newChat;

window.clearCurrentChat =
    clearCurrentChat;

window.switchChat =
    switchChat;

window.pinChat =
    pinChat;

window.deleteChat =
    deleteChat;

window.sendMessage =
    sendMessage;

window.sendFastQuery =
    sendFastQuery;

window.toggleDarkMode =
    toggleDarkMode;

window.toggleMute =
    toggleMute;