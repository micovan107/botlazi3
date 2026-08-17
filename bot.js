const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');

// Link SpicyChat
const SPICYCHAT_URL = "https://spicychat.ai/chat/134a8d8c-334d-4a45-8677-5fc00b76f58c/f901a5ef-3036-4fae-8669-941f2ef3f51e";

// Cookie SpicyChat
const RAW_SPICYCHAT_COOKIES = [
    { "domain": "spicychat.ai", "name": "country", "path": "/", "value": "VN" },
    { "domain": ".spicychat.ai", "name": "_fbp", "path": "/", "value": "fb.1.1786936006304.999019020231401591" },
    { "domain": ".spicychat.ai", "name": "_ga", "path": "/", "value": "GA1.1.1689896234.1786936007" },
    { "domain": ".spicychat.ai", "name": "_twpid", "path": "/", "value": "tw.1786936009545.349556690658312486" },
    { "domain": ".spicychat.ai", "name": "_rdt_uuid", "path": "/", "value": "1786936009561.8bbed8d8-1306-4e6a-b988-0c7bb04d5b4e" },
    { "domain": ".spicychat.ai", "name": "_gcl_au", "path": "/", "value": "1.1.1967950270.1786936007.1234333232.1786936032.1786939371.128721171.1786936032.1786939371" },
    { "domain": ".spicychat.ai", "name": "_ga_N38T5KLH16", "path": "/", "value": "GS2.1.s1786936006$o1$g1$t1786939371$j56$l0$h0" }
];

// Cookie Lazi
const RAW_LAZI_COOKIES = [
    { "domain": ".lazi.vn", "name": "PHPSESSID", "path": "/", "value": "4tj1q77mdspfce67o9f7bm3uc4" },
    { "domain": ".lazi.vn", "name": "lazi_identity", "path": "/", "value": "4657694" },
    { "domain": ".lazi.vn", "name": "lazi_remember_code", "path": "/", "value": "4838117af5d22fe39610ee3bc5292138b0b6e919" },
    { "domain": ".lazi.vn", "name": "lazi_vldu", "path": "/", "value": "2j0dsfabDhwP3cyXjfCw5%2BhXssqG81wugBeO05QCEfGEfkd2dj3c%2BMbHUp2eaeLGmjn%2FBYX4WknALJiCyoAihn1nGa5o2Q%3D%3Domzec2mb5s" },
    { "domain": ".lazi.vn", "name": "lazi_identity_code", "path": "/", "value": "4657694" },
    { "domain": ".lazi.vn", "name": "lazi_user_code", "path": "/", "value": "SDo0SyeXdgxuvP00XbFw1bJXwJP6lQwjOwAzH048gS7xvhPRMqX5KaoJB3r5K80TPE%2F6flp3Ai9esP2crjjl3A%3D%3D" },
    { "domain": ".lazi.vn", "name": "lazi_cms", "path": "/", "value": "H1cTHQcMDYQ%2F%2FY%2BIofx5ndj3kETm8TA4zHZpuBeVgzaUH3mEYGZE9Zyf6xMuXYmNw7YVW8qe%FJ0Bo5FmqDtx3qU3Nymt9lemE6%2Fym995V7KopWx%2FUAKbr%2FPXZre8HYnovrAr%2B9bysP2OIEnq19yDhudUIjm90xMXtjnJQtkuJx6Udt7vgNGscn1sYMr9Kj6mPC4XhxWH3dfBbI8rqQkTUbchDUooXUug1MtWhFzaGXudJ9rj0QB5vIXNd5WPqthFlsQgvjq%2Bf7Mnu0LIDHBZBAIPPwaDyylmvYYeiwDdHQYtZbNeMxVBVCjkdIhQ3bgAfui6dFUWPsEyePiU7VQs%2B86qqgHZaaugGObY0CMRwehbWw4KmzKwakFoiYDE8qa%2BNTuXprH6GROf4bLYWaFtjMENVZVfR7WxRUITbZ8Sg5KHvWI%2BgTpTzI5s8ZIU7pstfsv4BwPndZne7ZGwShKl7RsRDGSqcR6fnRNdczp8Xk7L%2B1QJAmHZoD%2BAgf0B8yX103S%2BwAsLNpLWf8NDZMKWCeM1U2X%2BuvYAzbK3LBfaCEUNITY%2Bb1uD5Azpan6K0hjQR3DgRlpsNMO37pLaIPnxMMKqFEyUz3Xe27uVnz9kxFO0vuPASySMXl5e1vhu0Pso" }
];

const processedMessagesNode = new Set();
const processingBoxes = new Set();

async function askSpicyChat(spicyPage, promptText) {
    try {
        const selectors = [
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="message"]',
            'textarea.resize-none',
            'textarea'
        ];

        let inputSelector = null;

        for (const sel of selectors) {
            try {
                await spicyPage.waitForSelector(sel, { visible: true, timeout: 4000 });
                inputSelector = sel;
                break;
            } catch (e) {}
        }

        if (!inputSelector) {
            console.error("❌ Không tìm thấy textarea! Đang lưu HTML trang...");
            const htmlContent = await spicyPage.content();
            fs.writeFileSync('spicychat_dump.html', htmlContent);
            console.log("-> Đã ghi file spicychat_dump.html");
            return null;
        }

        const initialBotMsgCount = await spicyPage.evaluate(() => {
            return document.querySelectorAll('div[class*="ChatMessage_bot"], div[data-is-user="false"], .chat-message.bot, div[data-is-bot="true"]').length;
        });

        await spicyPage.focus(inputSelector);
        await spicyPage.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (el) {
                el.value = '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, inputSelector);

        await spicyPage.type(inputSelector, promptText, { delay: 10 });
        await new Promise(r => setTimeout(r, 300));
        await spicyPage.keyboard.press('Enter');

        let lastText = "";
        let sameCount = 0;

        for (let i = 0; i < 60; i++) { 
            await new Promise(r => setTimeout(r, 600));

            const currentText = await spicyPage.evaluate((prevCount) => {
                const botMsgs = document.querySelectorAll(`
                    div[class*="ChatMessage_bot"], 
                    div[data-is-user="false"], 
                    .chat-message.bot,
                    div[data-is-bot="true"],
                    div[class*="message"]:not([class*="user"])
                `);

                if (botMsgs.length === 0 || botMsgs.length <= prevCount) return "";
                
                const lastBotMsg = botMsgs[botMsgs.length - 1];
                const contentEl = lastBotMsg.querySelector('.markdown-render, .prose, div[class*="text"]') || lastBotMsg;
                return contentEl ? contentEl.innerText.trim() : "";
            }, initialBotMsgCount);

            if (currentText && currentText === lastText) {
                sameCount++;
                if (sameCount >= 4) { 
                    return currentText;
                }
            } else {
                if (currentText) lastText = currentText;
                sameCount = 0;
            }
        }
        return lastText;
    } catch (err) {
        console.error("Lỗi tương tác SpicyChat UI:", err.message);
        return null;
    }
}

async function injectScanner(page) {
    console.log("[Hệ thống] Đang chích mã Quét Lazi...");
    await page.evaluate(() => {
        if (window.__laziScannerInterval) clearInterval(window.__laziScannerInterval);

        function scanAllActiveBoxes() {
            const boxes = document.querySelectorAll(".lzc_box_item_pc");
            boxes.forEach(box => {
                let boxId = box.getAttribute("data-id");
                if (!boxId) return;

                let rows = box.querySelectorAll(".lzc_body .brow");
                if (rows.length === 0) return;

                let lastRow = rows[rows.length - 1];
                if (!lastRow.classList.contains("bfriend")) return;

                let textEl = lastRow.querySelector('.rchat > div > div');
                if (!textEl) return;

                let currentText = textEl.innerText.trim();
                if (!currentText) return;

                let messageFingerprint = `${boxId}_${currentText}`;

                let nameEl = box.querySelector(".lzc_head .lzc_b_name");
                let targetName = nameEl ? (nameEl.getAttribute("data-origin") || nameEl.innerText.trim()) : "Đối phương";

                let contextArray = [];
                const targetRows = Array.from(rows).slice(-5);
                targetRows.forEach(r => {
                    let sender = r.classList.contains('bme') ? "Tôi" : targetName;
                    let el = r.querySelector('.rchat > div > div');
                    if (el) contextArray.push(`${sender}: ${el.innerText.trim()}`);
                });

                window.handleNewMessage(boxId, targetName, contextArray.join('\n'), messageFingerprint);
            });
        }

        window.__laziScannerInterval = setInterval(scanAllActiveBoxes, 700);
    });
}

(async () => {
    console.log("=== HỆ THỐNG BOT LAZI TÍCH HỢP SPICYCHAT ===");
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });

    console.log("Đang nạp cookie và khởi tạo SpicyChat...");
    const spicyPage = await browser.newPage();
    await spicyPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    for (const ck of RAW_SPICYCHAT_COOKIES) {
        await spicyPage.setCookie(ck);
    }

    await spicyPage.goto(SPICYCHAT_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log("-> Mở SpicyChat thành công!");

    const laziPage = await browser.newPage();
    await laziPage.setViewport({ width: 1280, height: 800 });

    console.log("Đang nạp Cookie Lazi...");
    for (const ck of RAW_LAZI_COOKIES) {
        await laziPage.setCookie(ck);
    }

    console.log("Đang truy cập Lazi.vn...");
    await laziPage.goto('https://lazi.vn', { waitUntil: 'networkidle2' });
    console.log("-> Đăng nhập Lazi thành công!");

    try {
        await laziPage.exposeFunction('handleNewMessage', async (boxId, targetName, contextText, fingerprint) => {
            if (processingBoxes.has(boxId) || processedMessagesNode.has(fingerprint)) return;

            processingBoxes.add(boxId);
            processedMessagesNode.add(fingerprint);

            if (processedMessagesNode.size > 1000) {
                const firstItem = processedMessagesNode.values().next().value;
                processedMessagesNode.delete(firstItem);
            }

            console.log(`\n[NodeJS] Nhận tin từ [${targetName}] (Box ID: ${boxId}). Gửi qua SpicyChat...`);
            
            let prompt = `(Tin nhắn từ ${targetName} trên Lazi): ${contextText}`;
            
            try {
                let aiReply = await askSpicyChat(spicyPage, prompt);
                
                if (aiReply && aiReply.trim()) {
                    console.log(`-> Trả lời [${targetName}]: ${aiReply.trim()}`);
                    
                    await laziPage.evaluate((id, replyText) => {
                        return new Promise((resolve) => {
                            const textInput = document.getElementById(`lzc_text_${id}`);
                            if (!textInput) return resolve();

                            textInput.innerText = replyText.trim();
                            textInput.dispatchEvent(new Event('input', { bubbles: true }));
                            textInput.dispatchEvent(new Event('change', { bubbles: true }));
                            textInput.dispatchEvent(new Event('keyup', { bubbles: true }));
                            
                            if (typeof window.lazi !== 'undefined' && typeof window.lazi.sendButton === 'function') {
                                window.lazi.sendButton(id);
                            } else {
                                const sendBtn = document.querySelector(`.lzc_box_item_pc[data-id="${id}"] .lzc_text_send`);
                                if (sendBtn) sendBtn.click();
                            }

                            setTimeout(() => {
                                const closeBtn = document.querySelector(`.lzc_close[data-id="${id}"]`);
                                if (closeBtn) {
                                    closeBtn.click();
                                } else if (typeof window.lazi !== 'undefined' && typeof window.lazi.closeBoxChat === 'function') {
                                    window.lazi.closeBoxChat({ getAttribute: () => id });
                                }
                                resolve();
                            }, 800);
                        });
                    }, boxId, aiReply).catch(e => console.log("Lỗi Send/Close Box:", e.message));
                }
            } catch (err) {
                console.error(`[Lỗi Box ${boxId}]:`, err.message);
            } finally {
                processingBoxes.delete(boxId);
            }
        });
    } catch (e) {}

    await injectScanner(laziPage);

    const TOTAL_RUN_TIME = 21300000;
    const CHECK_INTERVAL = 10000;
    let timeElapsed = 0;

    while (timeElapsed < TOTAL_RUN_TIME) {
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
        timeElapsed += CHECK_INTERVAL;
    }
    
    console.log("\n=== RESTART WORKFLOW GITHUB ACTIONS ===");
    try {
        execSync('gh workflow run treoweb.yml', { stdio: 'inherit' });
    } catch (err) {
        console.error("Lỗi trigger workflow:", err.message);
    }

    await browser.close();
})();
