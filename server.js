const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const PORT = 3000;


// ======================================================
// SERVER SOZLAMALARI
// ======================================================

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(express.static("."));


// ======================================================
// GEMINI API KEY
// ======================================================

const API_KEY =
    process.env.GEMINI_API_KEY;


if (!API_KEY) {

    console.error("");
    console.error("❌ GEMINI_API_KEY topilmadi!");
    console.error("");

    console.error(
        'PowerShellda quyidagini yozing:'
    );

    console.error("");

    console.error(
        '$env:GEMINI_API_KEY="SENING_KALITING"'
    );

    console.error("");

    process.exit(1);
}


// ======================================================
// GEMINI
// ======================================================

const ai =
    new GoogleGenAI({
        apiKey: API_KEY
    });


// ======================================================
// CHATLAR
// ======================================================

const chats =
    new Map();


// ======================================================
// AI USTOZ KO'RSATMASI
// ======================================================

const SYSTEM_INSTRUCTION = `

Sen "AI Ta’lim" saytining aqlli AI ustozisan.

Sening vazifang foydalanuvchilarga
darslarda va oddiy savollarda yordam berish.

Foydalanuvchi bilan tabiiy,
samimiy va ravon o'zbek tilida gaplash.

Oddiy suhbat bo'lsa,
oddiy va samimiy suhbatdosh kabi javob ber.

Dars haqida savol berilsa,
ustoz kabi tushuntir.

Matematika masalalarini
bosqichma-bosqich tushuntir.

Ingliz tili grammatikasi,
tarjima va so'zlarni tushuntir.

Fizika, kimyo, biologiya,
tarix, geografiya va ona tili
fanlarida sodda va tushunarli yordam ber.

Foydalanuvchi xato qilsa,
muloyimlik bilan to'g'rila.

Savol tushunarsiz bo'lsa,
aniqlashtiruvchi savol ber.

Keraksiz uzun javob yozma,
lekin kerak bo'lsa misollar bilan tushuntir.

Foydalanuvchi bilan hurmat bilan gaplash.

Sen "AI Ta’lim"ning
Jonkuyar Ustozisan.


==================================================
YARATUVCHI HAQIDA
==================================================

Agar foydalanuvchi:

"Seni kim yaratgan?"
"Kim seni yaratdi?"
"Yaratuvching kim?"
"AI Ta’limni kim yaratgan?"
"Bu saytni kim yaratgan?"
"Saytni kim yasagan?"
"Bu AI kimniki?"

yoki shunga o'xshash savol bersa,

aniq quyidagi mazmunda javob ber:

"Meni Abduvokhedov Shohjahon yaratgan. 🎓🤖"

Bu savollarga javob berishda
yaratuvchini boshqa ism bilan almashtirma.


==================================================
MUHIM
==================================================

O'zingni OpenAI yaratgan deb aytma.

Sen ushbu loyiha ichidagi
"AI Ta’lim" AI ustozisan.

Yaratuvchi haqida savol berilganda
Abduvokhedov Shohjahon nomini ishlat.

`;


// ======================================================
// CHAT API
// ======================================================

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const message =
                req.body.message;

            const conversationId =
                req.body.conversationId;


            // ------------------------------
            // TEKSHIRISH
            // ------------------------------

            if (!message) {

                return res.status(400).json({

                    error:
                        "Xabar yuborilmadi."

                });

            }


            if (!conversationId) {

                return res.status(400).json({

                    error:
                        "Suhbat ID yuborilmadi."

                });

            }


            // ==================================================
            // OLDINGI CHATNI TOPISH
            // ==================================================

            let chat =
                chats.get(
                    conversationId
                );


            // ==================================================
            // YANGI CHAT
            // ==================================================

            if (!chat) {

                chat =
                    ai.chats.create({

                        model:
                            "gemini-3.6-flash",

                        config: {

                            systemInstruction:
                                SYSTEM_INSTRUCTION,

                            temperature:
                                0.7

                        }

                    });


                chats.set(
                    conversationId,
                    chat
                );

            }


            // ==================================================
            // GEMINI'DAN JAVOB
            // ==================================================

            const response =
                await chat.sendMessage({

                    message:
                        message

                });


            // ==================================================
            // JAVOBNI TEKSHIRISH
            // ==================================================

            if (
                !response ||
                !response.text
            ) {

                return res.status(502).json({

                    error:
                        "Gemini bo'sh javob qaytardi."

                });

            }


            // ==================================================
            // JAVOB
            // ==================================================

            return res.json({

                reply:
                    response.text

            });


        } catch (error) {

            console.error("");
            console.error(
                "❌ GEMINI XATOSI:"
            );
            console.error(error);
            console.error("");


            return res.status(500).json({

                error:
                    error.message ||
                    "Gemini bilan bog'lanishda xatolik."

            });

        }

    }
);


// ======================================================
// SERVERNI ISHGA TUSHIRISH
// ======================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================"
        );

        console.log(
            "AI Ta'lim serveri ishga tushdi!"
        );

        console.log(
            "http://localhost:" +
            PORT
        );

        console.log(
            "================================"
        );

        console.log("");

    }
);