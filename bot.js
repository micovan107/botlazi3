const { execSync } = require('child_process');

// Tự động kiểm tra và cài đặt thư viện thiếu để hợp nhất với workflow YAML
try {
    require.resolve('puppeteer-extra');
    require.resolve('puppeteer-extra-plugin-stealth');
} catch (e) {
    console.log("[Hệ thống] Phát hiện thiếu puppeteer-extra, đang tự động cài đặt...");
    execSync('npm install puppeteer-extra puppeteer-extra-plugin-stealth --no-save', { stdio: 'inherit' });
}

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Cookie Lazi
const RAW_LAZI_COOKIES = [
    { "domain": ".lazi.vn", "name": "PHPSESSID", "path": "/", "value": "4tj1q77mdspfce67o9f7bm3uc4" },
    { "domain": ".lazi.vn", "name": "lazi_identity", "path": "/", "value": "4657694" },
    { "domain": ".lazi.vn", "name": "lazi_remember_code", "path": "/", "value": "4838117af5d22fe39610ee3bc5292138b0b6e919" },
    { "domain": ".lazi.vn", "name": "lazi_vldu", "path": "/", "value": "2j0dsfabDhwP3cyXjfCw5%2BhXssqG81wugBeO05QCEfGEfkd2dj3c%2BMbHUp2eaeLGmjn%2FBYX4WknALJiCyoAihn1nGa5o2Q%3D%3Domzec2mb5s" },
    { "domain": ".lazi.vn", "name": "lazi_identity_code", "path": "/", "value": "4657694" },
    { "domain": ".lazi.vn", "name": "lazi_user_code", "path": "/", "value": "SDo0SyeXdgxuvP00XbFw1bJXwJP6lQwjOwAzH048gS7xvhPRMqX5KaoJB3r5K80TPE%2F6flp3Ai9esP2crjjl3A%3D%3D" },
    { "domain": ".lazi.vn", "name": "lazi_cms", "path": "/", "value": "H1cTHQcMDYQ%2F%2FY%2BIofx5ndj3kETm8TA4zHZpuBeVgzaUH3mEYGZE9Zyf6xMuXYmNw7YVW8qe%2FJ0Bo5FmqDtx3qU3Nymt9lemE6%2Fym995V7KopWx%2FUAKbr%FPXZre8HYnovrAr%2B9bysP2OIEnq19yDhudUIjm90xMXtjnJQtkuJx6Udt7vgNGscn1sYMr9Kj6mPC4XhxWH3dfBbI8rqQkTUbchDUooXUug1MtWhFzaGXudJ9rj0QB5vIXNd5WPqthFlsQgvjq%2Bf7Mnu0LIDHBZBAIPPwaDyylmvYYeiwDdHQYtZbNeMxVBVCjkdIhQ3bgAfui6dFUWPsEyePiU7VQs%2B86qqgHZaaugGObY0CMRwehbWw4KmzKwakFoiYDE8qa%2BNTuXprH6GROf4bLYWaFtjMENVZVfR7WxRUITbZ8Sg5KHvWI%2BgTpTzI5s8ZIU7pstfsv4BwPndZne7ZGwShKl7RsRDGSqcR6fnRNdczp8Xk7L%2B1QJAmHZoD%2BAgf0B8yX103S%2BwAsLNpLWf8NDZMKWCeM1U2X%2BuvYAzbK3LBfaCEUNITY%2Bb1uD5Azpan6K0hjQR3DgRlpsNMO37pLaIPnxMMKqFEyUz3Xe27uVnz9kxFO0vuPASySMXl5e1vhu0Pso" }
];

// Cookie SpicyChat
const RAW_SPICYCHAT_DATA = {
    "url": "https://spicychat.ai",
    "cookies": [
        {"domain":"spicychat.ai","hostOnly":true,"httpOnly":false,"name":"country","path":"/","sameSite":"lax","secure":false,"session":true,"storeId":"0","value":"VN"},
        {"domain":".spicychat.ai","expirationDate":1794712928,"hostOnly":false,"httpOnly":false,"name":"_fbp","path":"/","sameSite":"lax","secure":false,"session":false,"storeId":"0","value":"fb.1.1786936006304.999019020231401591"},
        {"domain":".spicychat.ai","expirationDate":1821496929.025402,"hostOnly":false,"httpOnly":false,"name":"_ga","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"GA1.1.1689896234.1786936007"},
        {"domain":".spicychat.ai","expirationDate":1820632017.258301,"hostOnly":false,"httpOnly":false,"name":"_twpid","path":"/","sameSite":"strict","secure":true,"session":false,"storeId":"0","value":"tw.1786936009545.349556690658312486"},
        {"domain":".spicychat.ai","expirationDate":1794712928,"hostOnly":false,"httpOnly":false,"name":"_rdt_uuid","path":"/","sameSite":"strict","secure":true,"session":false,"storeId":"0","value":"1786936009561.8bbed8d8-1306-4e6a-b988-0c7bb04d5b4e"},
        {"domain":".spicychat.ai","expirationDate":1794712007,"hostOnly":false,"httpOnly":false,"name":"_gcl_au","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"1.1.1967950270.1786936007.1234333232.1786936032.1786936929.128721171.1786936032.1786936929"},
        {"domain":".spicychat.ai","expirationDate":1821496929.8748,"hostOnly":false,"httpOnly":false,"name":"_ga_N38T5KLH16","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"GS2.1.s1786936006$o1$g1$t1786936929$j57$l0$h0"}
    ]
};

const processedMessagesNode = new Set();
const processingBoxes = new Set();

// Format lại cookie SpicyChat cho khớp chuẩn Puppeteer
function formatCookies(cookies) {
    return cookies.map(c => {
        let ck = {
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path || '/',
            secure: !!c.secure,
            httpOnly: !!c.httpOnly
        };
        if (c.sameSite && ['Strict', 'Lax', 'None'].includes(c.sameSite.charAt(0).toUpperCase() + c.sameSite.slice(1).toLowerCase())) {
            ck.sameSite = c.sameSite.charAt(0).toUpperCase() + c.sameSite.slice(1).toLowerCase();
        }
        return ck;
    });
}

// Hàm dịch tự động dùng Google Translate API public
async function translateToVietnamese(text) {
    if (!text || !text.trim()) return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data[0]) {
            let translatedText = data[0].map(item => item[0]).join('');
            return translatedText.trim();
        }
        return text;
    } catch (err) {
        console.error("[Lỗi dịch thuật]:", err.message);
        return text;
    }
}

async function askSpicyChat(spicyPage, promptText) {
    try {
        const inputSelector = 'textarea';
        await spicyPage.waitForSelector(inputSelector, { timeout: 15000 });

        await spicyPage.evaluate((text, selector) => {
            const textarea = document.querySelector(selector);
            if (!textarea) return;
            
            const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            nativeTextareaValueSetter.call(textarea, text);

            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }, promptText, inputSelector);

        await new Promise(r => setTimeout(r, 500));
        await spicyPage.keyboard.press('Enter');

        await spicyPage.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]') || document.querySelector('button:has(svg)');
            if (btn) btn.click();
        });

        console.log("[SpicyChat] Đã đẩy prompt, chờ AI sinh văn bản...");

        let lastText = "";
        let stableCount = 0;
        let retry = 0;
        const maxRetry = 40;

        while (retry < maxRetry) {
            await new Promise(r => setTimeout(r, 1000));
            retry++;

            const currentText = await spicyPage.evaluate(() => {
                const msgNodes = document.querySelectorAll('div[class*="message"], div[class*="chat-bubble"], .prose');
                if (msgNodes.length === 0) return null;
                const lastNode = msgNodes[msgNodes.length - 1];
                return lastNode ? lastNode.innerText.trim() : null;
            });

            if (currentText && currentText === lastText && currentText.length > 0) {
                stableCount++;
                if (stableCount >= 2) {
                    return currentText;
                }
            } else if (currentText) {
                lastText = currentText;
                stableCount = 0;
            }
        }

        return lastText || "Hừm, hiện tại tôi không biết trả lời sao nữa!";
    } catch (err) {
        console.error("Lỗi SpicyChat:", err.message);
        return null;
    }
}

async function injectScanner(page) {
    console.log("[Hệ thống] Đang chích mã Quét Băng Chuyền Tối Ưu...");
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
                if (lastRow.classList.contains("bme")) return;

                let textEl = lastRow.querySelector('.rchat') || lastRow;
                let currentText = textEl ? textEl.innerText.trim() : "";
                if (!currentText) return;

                let messageFingerprint = `${boxId}_${currentText}`;

                let nameEl = box.querySelector(".lzc_head .lzc_b_name");
                let targetName = nameEl ? (nameEl.getAttribute("data-origin") || nameEl.innerText.trim()) : "Đối phương";

                let contextArray = [];
                const targetRows = Array.from(rows).slice(-5);
                targetRows.forEach(r => {
                    let sender = r.classList.contains('bme') ? "Tôi" : targetName;
                    let el = r.querySelector('.rchat') || r;
                    if (el) contextArray.push(`${sender}: ${el.innerText.trim().replace(/\n/g, ' ')}`);
                });

                if (typeof window.handleNewMessage === 'function') {
                    window.handleNewMessage(boxId, targetName, contextArray.join('\n'), messageFingerprint);
                }
            });
        }

        window.__laziScannerInterval = setInterval(scanAllActiveBoxes, 1000);
        console.log("[Browser] Đã bật bẫy quét tin nhắn!");
    });
}

(async () => {
    console.log("=== HỆ THỐNG BOT LAZI TỰ ĐỘNG (SPICYCHAT AUTOMATION + TRANSLATE) ===");
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    });

    console.log("Đang nạp Cookie & Mở SpicyChat AI...");
    const spicyPage = await browser.newPage();
    await spicyPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Nạp cookie SpicyChat
    const formattedSpicyCookies = formatCookies(RAW_SPICYCHAT_DATA.cookies);
    for (const ck of formattedSpicyCookies) {
        await spicyPage.setCookie(ck);
    }

    await spicyPage.goto('https://spicychat.ai/chat/134a8d8c-334d-4a45-8677-5fc00b76f58c/f901a5ef-3036-4fae-8669-941f2ef3f51e', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log("-> Đã nạp thành công SpicyChat UI với Session!");

    const laziPage = await browser.newPage();
    await laziPage.setViewport({ width: 1280, height: 800 });

    // Nạp cookie Lazi
    for (const ck of RAW_LAZI_COOKIES) {
        await laziPage.setCookie(ck);
    }

    const setupExpose = async () => {
        try {
            await laziPage.exposeFunction('handleNewMessage', async (boxId, targetName, contextText, fingerprint) => {
                if (processingBoxes.has(boxId) || processedMessagesNode.has(fingerprint)) return;

                processingBoxes.add(boxId);
                processedMessagesNode.add(fingerprint);

                if (processedMessagesNode.size > 1000) {
                    const firstItem = processedMessagesNode.values().next().value;
                    processedMessagesNode.delete(firstItem);
                }

                console.log(`\n[NodeJS] Nhận tin mới từ [${targetName}] (Box: ${boxId})`);
                
                let prompt = `[Hệ thống: Bạn đang nhắn tin với "${targetName}" trên Lazi. Xưng hô phù hợp, hài hước, cá tính. Không nhận là AI.]\n\nNgữ cảnh:\n${contextText}\n\nTrả lời ngắn gọn:`;
                
                try {
                    let aiReply = await askSpicyChat(spicyPage, prompt);
                    
                    if (aiReply && aiReply.trim()) {
                        console.log(`[Gốc AI]: ${aiReply.trim()}`);
                        
                        let translatedReply = await translateToVietnamese(aiReply);
                        console.log(`-> Dịch gửi Lazi [${targetName}]: ${translatedReply}`);
                        
                        await laziPage.evaluate((id, replyText) => {
                            return new Promise((resolve) => {
                                const textInput = document.getElementById(`lzc_text_${id}`);
                                if (!textInput) return resolve();

                                textInput.innerText = replyText.trim();
                                textInput.dispatchEvent(new Event('input', { bubbles: true }));
                                textInput.dispatchEvent(new Event('change', { bubbles: true }));
                                
                                const sendBtn = document.querySelector(`.lzc_box_item_pc[data-id="${id}"] .lzc_text_send`);
                                if (sendBtn) sendBtn.click();
                                else if (window.lazi && typeof window.lazi.sendButton === 'function') window.lazi.sendButton(id);

                                setTimeout(() => {
                                    const closeBtn = document.querySelector(`.lzc_close[data-id="${id}"]`);
                                    if (closeBtn) closeBtn.click();
                                    resolve();
                                }, 1000);
                            });
                        }, boxId, translatedReply).catch(e => console.log("Lỗi gửi tin:", e.message));
                    }
                } catch (err) {
                    console.error(`[Lỗi Box ${boxId}]:`, err.message);
                } finally {
                    processingBoxes.delete(boxId);
                }
            });
        } catch (e) { }
    };

    await setupExpose();

    console.log("Đang truy cập Lazi.vn...");
    await laziPage.goto('https://lazi.vn', { waitUntil: 'networkidle2' });
    await injectScanner(laziPage);

    laziPage.on('domcontentloaded', async () => {
        await injectScanner(laziPage);
    });

    const TOTAL_RUN_TIME = 21300000;
    const CHECK_INTERVAL = 10000;
    const RELOAD_INTERVAL = 3600000;
    
    let timeElapsed = 0;
    let timeSinceLastReload = 0;

    while (timeElapsed < TOTAL_RUN_TIME) {
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
        timeElapsed += CHECK_INTERVAL;
        timeSinceLastReload += CHECK_INTERVAL;

        if (timeSinceLastReload >= RELOAD_INTERVAL) {
            console.log("\n[Hệ thống] Reload làm tươi phiên làm việc...");
            try {
                await spicyPage.reload({ waitUntil: 'networkidle2' });
                await laziPage.reload({ waitUntil: 'networkidle2' });
                timeSinceLastReload = 0;
            } catch (reloadErr) {
                console.error("[Lỗi Reload]:", reloadErr.message);
            }
        }
    }
    
    console.log("\n=== KÍCH HOẠT WORKFLOW TIẾP THEO TRÊN GITHUB ACTIONS ===");
    try {
        execSync('gh workflow run treoweb.yml', { stdio: 'inherit' });
    } catch (err) {
        console.error("Lỗi trigger GH Actions:", err.message);
    }

    await browser.close();
})();
