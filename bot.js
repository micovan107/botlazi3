const { execSync } = require('child_process');
const fs = require('fs');

// Tự động kiểm tra và cài đặt thư viện thiếu
try {
    require.resolve('puppeteer-extra');
    require.resolve('puppeteer-extra-plugin-stealth');
    require.resolve('form-data');
} catch (e) {
    console.log("[Hệ thống] Phát hiện thiếu thư viện, đang tự động cài đặt...");
    execSync('npm install puppeteer-extra puppeteer-extra-plugin-stealth form-data --no-save', { stdio: 'inherit' });
}

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const FormData = require('form-data');
puppeteer.use(StealthPlugin());

const IMGBB_API_KEY = '6013a04256e0c8dcdc6bcae78748f8f4';

// Helper log có timestamp
function log(level, msg, detail = null) {
    const time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let output = `[${time}] [${level}] ${msg}`;
    console.log(output);
    if (detail) {
        if (detail instanceof Error) {
            console.error(`  └─ Stack Trace: ${detail.stack}`);
        } else {
            console.error(`  └─ Chi tiết:`, detail);
        }
    }
}

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

// Upload ảnh chụp màn hình lên ImgBB
async function uploadToImgBB(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            log('WARN', `File ảnh không tồn tại để upload: ${filePath}`);
            return null;
        }
        const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
        
        const form = new FormData();
        form.append('image', fileData);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: form
        });
        const json = await res.json();
        if (json && json.data && json.data.url) {
            return json.data.url;
        }
        log('ERROR', 'ImgBB phản hồi không chứa URL ảnh:', json);
        return null;
    } catch (err) {
        log('ERROR', 'Lỗi ngoại lệ khi upload ảnh ImgBB:', err);
        return null;
    }
}

// Chụp và up ảnh màn hình khi gặp sự cố
async function captureAndUploadDebug(spicyPage, laziPage, prefix = "error") {
    log('DEBUG', `Đang tiến hành chụp màn hình debug (${prefix})...`);
    const time = Date.now();
    const fileSpicy = `spicy_${prefix}_${time}.png`;
    const fileLazi = `lazi_${prefix}_${time}.png`;

    try {
        if (spicyPage && !spicyPage.isClosed()) {
            await spicyPage.screenshot({ path: fileSpicy, fullPage: true }).catch(e => log('WARN', 'Chụp SpicyPage thất bại:', e.message));
        }
        if (laziPage && !laziPage.isClosed()) {
            await laziPage.screenshot({ path: fileLazi, fullPage: true }).catch(e => log('WARN', 'Chụp LaziPage thất bại:', e.message));
        }

        const urlSpicy = await uploadToImgBB(fileSpicy);
        const urlLazi = await uploadToImgBB(fileLazi);

        log('INFO', `📸 Ảnh SpicyChat Debug: ${urlSpicy || 'Không tạo được URL'}`);
        log('INFO', `📸 Ảnh Lazi Debug: ${urlLazi || 'Không tạo được URL'}`);

        if (fs.existsSync(fileSpicy)) fs.unlinkSync(fileSpicy);
        if (fs.existsSync(fileLazi)) fs.unlinkSync(fileLazi);
    } catch (e) {
        log('ERROR', 'Thất bại hoàn toàn trong quy trình Capture/Upload Debug:', e);
    }
}

async function translateToVietnamese(text) {
    if (!text || !text.trim()) return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) {
            log('WARN', `Google Translate API trả về status: ${res.status}`);
            return text;
        }
        const data = await res.json();
        if (data && data[0]) {
            let translatedText = data[0].map(item => item[0]).join('');
            return translatedText.trim();
        }
        return text;
    } catch (err) {
        log('ERROR', 'Lỗi khi gọi dịch thuật Google Translate:', err);
        return text;
    }
}

async function askSpicyChat(spicyPage, laziPage, promptText) {
    try {
        const inputSelector = 'textarea, div[contenteditable="true"], [placeholder*="Message"], [placeholder*="message"]';
        
        log('DEBUG', '[SpicyChat] Tìm kiếm selector ô nhập liệu...');
        await spicyPage.waitForSelector(inputSelector, { visible: true, timeout: 20000 }).catch(async (err) => {
            log('ERROR', '[SpicyChat] LỖI: Timeout không thấy ô nhập văn bản chat!');
            await captureAndUploadDebug(spicyPage, laziPage, "spicy_noselector");
            throw err;
        });

        const initialMsgCount = await spicyPage.evaluate(() => {
            return document.querySelectorAll('div[class*="message"], div[class*="chat-bubble"], .prose').length;
        });
        log('DEBUG', `[SpicyChat] Số tin nhắn hiện tại trước khi gửi: ${initialMsgCount}`);

        await spicyPage.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (el) {
                el.focus();
                if (el.tagName === 'TEXTAREA') el.value = '';
                else el.innerText = '';
            }
        }, inputSelector);

        const inputEl = await spicyPage.$(inputSelector);
        if (inputEl) await inputEl.click();

        await spicyPage.type(inputSelector, promptText, { delay: 10 });
        await new Promise(r => setTimeout(r, 500));

        await spicyPage.keyboard.press('Enter');

        await spicyPage.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]') || 
                        document.querySelector('button:has(svg)') ||
                        document.querySelector('button[aria-label*="Send"]');
            if (btn && !btn.disabled) btn.click();
        });

        log('INFO', '[SpicyChat] Đã phát lệnh gửi Prompt. Đang chờ AI sinh phản hồi...');

        let lastText = "";
        let stableCount = 0;
        let retry = 0;
        const maxRetry = 40;

        while (retry < maxRetry) {
            await new Promise(r => setTimeout(r, 1000));
            retry++;

            const currentText = await spicyPage.evaluate((initCount) => {
                const msgNodes = document.querySelectorAll('div[class*="message"], div[class*="chat-bubble"], .prose');
                if (msgNodes.length <= initCount) return null;
                
                const lastNode = msgNodes[msgNodes.length - 1];
                return lastNode ? lastNode.innerText.trim() : null;
            }, initialMsgCount);

            if (currentText && currentText === lastText && currentText.length > 0) {
                stableCount++;
                if (stableCount >= 2) {
                    log('INFO', `[SpicyChat] AI đã phản hồi xong sau ${retry} giây.`);
                    return currentText;
                }
            } else if (currentText) {
                lastText = currentText;
                stableCount = 0;
            }
        }

        log('WARN', '[SpicyChat] AI phản hồi lâu vượt quá timeout chờ. Lấy dữ liệu đoạn cuối cùng thu thập được.');
        return lastText || "Hừm, hiện tại tôi không biết trả lời sao nữa!";
    } catch (err) {
        log('ERROR', 'Ngoại lệ xảy ra trong askSpicyChat:', err);
        return null;
    }
}

async function injectScanner(page) {
    log('INFO', 'Đang thực thi chích mã Scanner vào môi trường DOM Lazi...');
    try {
        await page.evaluate(() => {
            if (window.__laziScannerInterval) clearInterval(window.__laziScannerInterval);

            function scanAllActiveBoxes() {
                try {
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
                } catch (e) {
                    console.error("[DOM Scanner Error]:", e);
                }
            }

            window.__laziScannerInterval = setInterval(scanAllActiveBoxes, 1000);
            console.log("[Browser DOM] Scanner Interval đã khởi tạo thành công.");
        });
    } catch (e) {
        log('ERROR', 'Inject scanner thất bại:', e);
    }
}

// Bắt lỗi toàn cục crash Node.js
process.on('uncaughtException', (err) => {
    log('FATAL', 'Phát hiện Uncaught Exception toàn cục!', err);
});

process.on('unhandledRejection', (reason, promise) => {
    log('FATAL', 'Phát hiện Unhandled Rejection tại Promise!', reason);
});

(async () => {
    log('INFO', '=== HỆ THỐNG BOT LAZI TỰ ĐỘNG (SPICYCHAT AUTOMATION + DEBUG LOGS) ===');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
    } catch (err) {
        log('FATAL', 'Không thể khởi chạy Chromium Puppeteer:', err);
        process.exit(1);
    }

    log('INFO', 'Khởi tạo Tab SpicyChat & nạp Cookie...');
    const spicyPage = await browser.newPage();
    await spicyPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const formattedSpicyCookies = formatCookies(RAW_SPICYCHAT_DATA.cookies);
    for (const ck of formattedSpicyCookies) {
        await spicyPage.setCookie(ck).catch(e => log('WARN', `Lỗi set cookie SpicyChat (${ck.name}):`, e.message));
    }

    await spicyPage.goto('https://spicychat.ai/chat/134a8d8c-334d-4a45-8677-5fc00b76f58c/f901a5ef-3036-4fae-8669-941f2ef3f51e', { waitUntil: 'networkidle2', timeout: 60000 }).catch(async (e) => {
        log('ERROR', '[Lỗi Load SpicyChat]:', e);
        await captureAndUploadDebug(spicyPage, null, "spicy_load_failed");
    });
    log('INFO', '-> Tải giao diện SpicyChat thành công!');

    log('INFO', 'Khởi tạo Tab Lazi & nạp Cookie...');
    const laziPage = await browser.newPage();
    await laziPage.setViewport({ width: 1280, height: 800 });

    for (const ck of RAW_LAZI_COOKIES) {
        await laziPage.setCookie(ck).catch(e => log('WARN', `Lỗi set cookie Lazi (${ck.name}):`, e.message));
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

                log('INFO', `[NodeJS] Nhận tin mới từ [${targetName}] (Box: ${boxId})`);
                
                let prompt = `[Hệ thống: Bạn đang nhắn tin với "${targetName}" trên Lazi. Xưng hô phù hợp, hài hước, cá tính. Không nhận là AI.]\n\nNgữ cảnh:\n${contextText}\n\nTrả lời ngắn gọn:`;
                
                try {
                    let aiReply = await askSpicyChat(spicyPage, laziPage, prompt);
                    
                    if (aiReply && aiReply.trim()) {
                        log('INFO', `[Gốc AI]: ${aiReply.trim()}`);
                        
                        let translatedReply = await translateToVietnamese(aiReply);
                        log('INFO', `-> Dịch gửi Lazi [${targetName}]: ${translatedReply}`);
                        
                        const sendResult = await laziPage.evaluate((id, replyText) => {
                            return new Promise((resolve) => {
                                const textInput = document.getElementById(`lzc_text_${id}`);
                                if (!textInput) return resolve({ success: false, reason: "Không tìm thấy ô input lzc_text_" + id });

                                textInput.innerText = replyText.trim();
                                textInput.dispatchEvent(new Event('input', { bubbles: true }));
                                textInput.dispatchEvent(new Event('change', { bubbles: true }));
                                
                                const sendBtn = document.querySelector(`.lzc_box_item_pc[data-id="${id}"] .lzc_text_send`);
                                if (sendBtn) {
                                    sendBtn.click();
                                } else if (window.lazi && typeof window.lazi.sendButton === 'function') {
                                    window.lazi.sendButton(id);
                                } else {
                                    return resolve({ success: false, reason: "Không tìm thấy nút Send" });
                                }

                                setTimeout(() => {
                                    const closeBtn = document.querySelector(`.lzc_close[data-id="${id}"]`);
                                    if (closeBtn) closeBtn.click();
                                    resolve({ success: true });
                                }, 1000);
                            });
                        }, boxId, translatedReply);

                        if (!sendResult.success) {
                            log('WARN', `Lỗi khi thực thi gửi tin trên DOM Lazi Box ${boxId}: ${sendResult.reason}`);
                        } else {
                            log('INFO', `Đã trả lời thành công cho ${targetName} (Box ${boxId})`);
                        }
                    } else {
                        log('WARN', `SpicyChat không trả về kết quả hợp lệ cho Box ${boxId}`);
                    }
                } catch (err) {
                    log('ERROR', `Lỗi xử lý luồng phản hồi cho Box ${boxId}:`, err);
                    await captureAndUploadDebug(spicyPage, laziPage, `box_error_${boxId}`);
                } finally {
                    processingBoxes.delete(boxId);
                }
            });
            log('INFO', 'Đã phơi bày (expose) hàm handleNewMessage sang Browser context.');
        } catch (e) {
            log('ERROR', 'Lỗi khi setupExpose:', e);
        }
    };

    await setupExpose();

    log('INFO', 'Đang điều hướng đến Lazi.vn...');
    await laziPage.goto('https://lazi.vn', { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => log('ERROR', 'Lỗi truy cập Lazi:', e));
    await injectScanner(laziPage);

    laziPage.on('domcontentloaded', async () => {
        log('DEBUG', 'Lazi Trigger: domcontentloaded -> Re-injecting Scanner...');
        await injectScanner(laziPage);
    });

    laziPage.on('framenavigated', async (frame) => {
        if (frame === laziPage.mainFrame()) {
            log('DEBUG', 'Lazi Main Frame Navigated -> Re-injecting Scanner...');
            await injectScanner(laziPage);
        }
    });

    const TOTAL_RUN_TIME = 21300000; // ~5.9 tiếng
    const CHECK_INTERVAL = 10000;
    const RELOAD_INTERVAL = 3600000; // 1 tiếng làm tươi
    
    let timeElapsed = 0;
    let timeSinceLastReload = 0;

    log('INFO', 'Bắt đầu vòng lặp theo dõi hệ thống chính.');

    while (timeElapsed < TOTAL_RUN_TIME) {
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
        timeElapsed += CHECK_INTERVAL;
        timeSinceLastReload += CHECK_INTERVAL;

        if (timeSinceLastReload >= RELOAD_INTERVAL) {
            log('INFO', '🔄 [Hệ thống] Định kỳ 1 giờ: Reload làm tươi phiên làm việc trên cả 2 trang...');
            try {
                await spicyPage.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                await laziPage.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                await injectScanner(laziPage);
                timeSinceLastReload = 0;
                log('INFO', '🔄 Reload làm tươi phiên làm việc thành công.');
            } catch (reloadErr) {
                log('ERROR', 'Lỗi trong quá trình Reload định kỳ:', reloadErr);
                await captureAndUploadDebug(spicyPage, laziPage, "reload_error");
            }
        }
    }
    
    log('INFO', '=== HOÀN THÀNH THỜI GIAN CHẠY! KÍCH HOẠT WORKFLOW TIẾP THEO TRÊN GITHUB ACTIONS ===');
    try {
        execSync('gh workflow run treoweb.yml', { stdio: 'inherit' });
        log('INFO', 'Đã gửi lệnh kích hoạt GitHub Actions workflow thành công.');
    } catch (err) {
        log('ERROR', 'Lỗi không thể trigger GH Actions workflow:', err);
    }

    await browser.close();
    log('INFO', 'Trình duyệt đã đóng. Kết thúc tiến trình.');
})();
