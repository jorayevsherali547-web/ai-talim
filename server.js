const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("."));

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY topilmadi!");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: API_KEY
});

const SYSTEM_INSTRUCTION = `
Sen "AI Ta'lim" saytining aqlli AI ustozisan.

Foydalanuvchi bilan tabiiy, samimiy va ravon o'zbek tilida gaplash.

Oddiy suhbat bo'lsa oddiy va samimiy javob ber.

Dars haqida savol berilsa ustoz kabi tushuntir.

Matematika masalalarini bosqichma-bosqich va aniq yech.
Kerak bo'lsa formulalar, hisob-kitoblar va misollar bilan tushuntir.

Ingliz tili grammatikasi, tarjima va so'zlarni tushuntir.

Fizika, kimyo, biologiya, tarix, geografiya
va ona tili fanlarida sodda va tushunarli yordam ber.

Foydalanuvchi xato qilsa, muloyimlik bilan to'g'rila.

Savol tushunarsiz bo'lsa, aniqlashtiruvchi savol ber.

Javobni juda qisqa qilib yuborma.
Savolga imkon qadar to'liq, aniq va foydali javob ber.

Keraksiz gaplarni ko'paytirma.

Foydalanuvchi bilan hurmat bilan gaplash.

Sen "AI Ta'lim"ning Jonkuyar Ustozisan.

Agar foydalanuvchi seni kim yaratgani,
AI Ta'limni kim yaratgani yoki saytni kim yasagani haqida so'rasa:

"Meni Abduvokhedov Shohjahon yaratgan. 🎓🤖"

deb javob ber.
`;

const chats = new Map();

function createNewChat() {
    return ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7
        }
    });
}

app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;
        const conversationId = req.body.conversationId;

        if (!message) {
            return res.status(400).json({
                error: "Xabar yuborilmadi."
            });
        }

        if (!conversationId) {
            return res.status(400).json({
                error: "Suhbat ID yuborilmadi."
            });
        }

        let chat = chats.get(conversationId);

        if (!chat) {
            chat = createNewChat();
            chats.set(conversationId, chat);
        }

        console.log("🤖 Savol:", message);

        const response = await chat.sendMessage({
            message: message
        });

        if (!response || !response.text) {
            throw new Error("AI bo'sh javob qaytardi.");
        }

        console.log("✅ AI javob berdi");

        return res.json({
            reply: response.text
        });

    } catch (error) {
        console.error("❌ SERVER XATOSI:", error);

        const errorText = String(error.message || error);

        if (
            errorText.includes("429") ||
            errorText.toLowerCase().includes("quota")
        ) {
            return res.status(429).json({
                error: "Gemini API kvotasi tugagan. Keyinroq yana urinib ko'ring."
            });
        }

        return res.status(500).json({
            error: "AI bilan bog'lanishda xatolik."
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("🤖 AI TA'LIM");
    console.log("================================");
    console.log("Model: gemini-2.5-flash");
    console.log("PORT:", PORT);
    console.log("✅ Server ishga tushdi!");
    console.log("================================");
});
