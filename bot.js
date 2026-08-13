const puppeteer = require('puppeteer-core');
const axios = require('axios');

// Cookie dự phòng ban đầu
const INITIAL_QUILLBOT_COOKIE = "abIDV2=492; _sp_ses.48cd=*; anonID=746e9178b57158d9; authenticated=false; premium=false; acceptedPremiumModesTnc=false; g_state={\"i_l\":0,\"i_ll\":1780744047776,\"i_b\":\"xmXnUoDTgPIl6ZZ+6e1JM2RI7bQ/yopAxaDotff/TOM\",\"i_e\":{\"enable_itp_optimization\":0},\"i_et\":1780744047770}; qdid=42efbd8009479e3ba4f5b3de2f36f505; connect.sid=s:_dHwC5cmuvC6tiaj8cSyrlWA7FdXdeo4.RlHPJOlT+GQQqSkZsIHlpcVyDqDHoMbY4mDoHmUry74; qb_anon_id=ea5e281f716950dae2176e6fe4ab79e01ec79de4b955e8868855c9a4dd80a962.8c83e63fac14f43253e54344390150552ca554a0b424d4e394163b97e07af70c; __cf_bm=D8YuS6xW4V_kQdhsb4ML.SB4TeT46YGfH3VwZdbovx8-1780744050.3231413-1.0.1.1-NobpSYvCP2IrTyt8huQ1qtkRsMdd2hr9buaVewHiCcC7SVO8y.FkdFb1K8r0PTxu4ETka6N_WgTK8K0PCzvcF6A5.3C_9oMXw93lcq0HFEFr6m8L_Yab3VdQNbn26Smq; AMP_MKTG_6e403e775d=%7B%22referrer%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22referring_domain%22%3A%22www.google.com%22%7D; qbDeviceId=b2ec739d-e195-454f-81bb-a63786a781d9; cl_val=43; _gcl_au=1.1.1557228843.1780744049; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Jun+06+2026+18%3A07%3A29+GMT%2B0700+(Gi%E1%BB%9D+%C4%90%C3%B4ng+D%C6%B0%C6%A1ng)&version=202605.1.0&browserGpcFlag=0&isDntEnabled=0&isIABGlobal=false&hosts=&landingPath=https%3A%2F%2Fquillbot.com%2Fai-chat&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0005%3A1; _ga=GA1.1.605710320.1780744050; FPID=FPID2.2.Dc9CYf2pr0fruo44EI+XnQz/vO9RkRUHcL3ww1t5xD4=.1780744050; FPLC=Fy8dOynxtOP6HdK7DxgdWFYvHQrDZ+dWLHrkBNcPE7yaWknvxrN+nzBPq8p27tiOVpCirhSVEIdj6XaDzD1/pMmoMauZrs+6J+1zsGCj1X+FiwQRU632uLgWvxBR8w==; FPAU=1.1.1557228843.1780744049; _clck=apdfri^2^g6o^0^2348; _clsk=1ddbi5m^1780744052215^1^0^t.clarity.ms/collect; _ga_D39F2PYGLM=GS2.1.s1780744049$o1$g1$t1780744052$j57$l0$h46958804; _uetsid=e8c43540619711f180111fdc8566318e; _uetvid=e8c485a0619711f1ae02d5451160de39; theme=dark; AMP_6e403e775d=%7B%22deviceId%22%3A%22b2ec739d-e195-454f-81bb-a63786a781d9%22%2C%22sessionId%22%3A1780744048890%2C%22optOut%22%3Afalse%2C%22lastEventTime%22%3A1780744180487%2C%22lastEventId%22%3A25%2C%22pageCounter%22%3A0%2C%22cookieDomain%22%3A%22.quillbot.com%22%7D; _sp_id.48cd=8a7e9aef-10e7-48d0-9588-819bed3fcb00.1780744047.1.1780744181..e01b7da6-3146-4b61-be9f-8ade984daf4c..bfcce7bd-c15b-402f-9e8f-c4b7057ea4f9.1780744048898.16";

// Lưu trữ Link API và Header động thu thập được
let activeQuillBotApiUrl = "https://quillbot.com/api/ai-chat/chat/conversation/be6e38e2-1138-43e4-93ee-9af0bea2190a";
let activeQuillBotHeaders = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Platform-Type": "webapp",
    "Qb-Product": "AI-CHAT",
    "Cookie": INITIAL_QUILLBOT_COOKIE
};

const RAW_LAZI_COOKIES = [
  {"domain": "lazi.vn", "name": "PHPSESSID", "path": "/", "value": "kincnah3od5gqtk9rk0fgvevh0"},
  {"domain": ".lazi.vn", "name": "lazi_identity", "path": "/", "value": "4038338"},
  {"domain": ".lazi.vn", "name": "lazi_remember_code", "path": "/", "value": "fd291a2019111e7b871694f37b7c801e5395a114"},
  {"domain": ".lazi.vn", "name": "lazi_vldu", "path": "/", "value": "zdvh9g57ELN6SEA8vGjW3cBYkWXA%2BsbMGphuVZJ4AJVZHgjXlbLW9UAtNsCk7%2BqPuMncus7ZmofdpCoRIp3ehWnyfdBrrg%3D%3D2z9ks57krt"},
  {"domain": ".lazi.vn", "name": "lazi_identity_code", "path": "/", "value": "4038338"},
  {"domain": ".lazi.vn", "name": "lazi_user_code", "path": "/", "value": "JLu7jWFQHBI12BALjNVClg0s5E0ZEudFe%2FOn%2FGgWQ%2BVhM5V%2FuJFb7gknddIKNCxJGbUK4cG5PqxQKACMm%2BXaqg%3D%3D"},
  {"domain": ".lazi.vn", "name": "lazi_cms", "path": "/", "value": "FPKqNZ4G5oAmYWQop246xUI%2BmtdYDVk94nOHwHYNdRQpFnVFGxuugoPW2LfQ9iCoXwlCoZCepy9t2BEs%2FH5GrcY9vvy9f0AoMe6ybkw%2FTUnG2Vsnt1prM0%2FI2PhoYTP9SbYCyFFnkF3LPSPcDQOSgBbFXv6UPo%2FqxpAcV5Zb%2FOn9dU6mFXuQuvK6T3MQuYPZmEzGzARhR1TlJLJqFPLBJ3NTIWhXjighb9DrF5GM5bk4MqeXdt3aeGbutAEtAk2LZbm9MHryVKAqc%2B5Au12qvEChovjn3uMZ5%2FUBSkKYIatY7iTuue9e9dBlWRASHYJNXAiJou5f7gbpA5oevCEWMQNrPqSexlAfBvIlj2AURCRh9PuLt%2Fe42fViv2snyibuVsm%2Bk4y3%2FselIBJy46eStPq0y474FXJSyHCte9p8WQXhT%2F3t3Z9sxdwukESAbCTIp%2BJ9pG0xaIlPB0sdSfRXnSKmvASDRugi1YOEjBkCTHOdWjaIAMNQSeH6Jp0Qr8BqSwP9Prpc2%2F9Yl3uoKSeisnlMHmxJP2I2%2Bw6xVrT5lfCCALWoVv80CWS8iLVj%2FVGrITK8BZHseZEqc8KH1MraUPtVtkVEXc5xcWXuW97kqTQrBGEhrA1%2BszeWj9VQTALx"}
];

const LAZI_COOKIES = RAW_LAZI_COOKIES.map(cookie => {
    if (!cookie.domain) {
        cookie.domain = '.lazi.vn';
    }
    return cookie;
});

function parseStreamText(rawText) {
    const regex = /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let match;
    let accumulatedContent = "";
    while ((match = regex.exec(rawText)) !== null) {
        try {
            accumulatedContent += JSON.parse(`"${match[1]}"`);
        } catch (e) {
            accumulatedContent += match[1];
        }
    }
    return accumulatedContent;
}

// Hàm mở tab QuillBot ngầm để "săn" Link API conversation tươi + Cookie/Headers mới nhất
async function fetchFreshQuillBotConfig(browser) {
    console.log("[QuillBot Fetcher] Đang khởi tạo tab ngầm để săn Link API tươi...");
    let qbPage = null;
    try {
        qbPage = await browser.newPage();
        await qbPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await qbPage.setRequestInterception(true);

        qbPage.on('request', interceptedRequest => {
            const url = interceptedRequest.url();
            if (url.includes('/api/ai-chat/chat/conversation/')) {
                console.log('\n[QuillBot Fetcher] ==> ĐÃ BẮT ĐƯỢC LINK API MỚI:', url);
                activeQuillBotApiUrl = url;
                
                // Lấy toàn bộ headers gửi đi từ browser (chứa Cookie + Auth tươi nhất)
                const headers = interceptedRequest.headers();
                activeQuillBotHeaders = {
                    ...activeQuillBotHeaders,
                    ...headers,
                    "Accept": "text/event-stream",
                    "Content-Type": "application/json"
                };
                console.log('[QuillBot Fetcher] ==> Đã cập nhật Cookie & Header mới nhất!\n');
            }
            interceptedRequest.continue();
        });

        await qbPage.goto('https://quillbot.com/ai-chat', { waitUntil: 'networkidle2', timeout: 60000 });

        // Gõ nhẹ 1 chữ mồi để QuillBot tự bắn Request API khởi tạo conversation
        const inputSelector = 'textarea, div[contenteditable="true"]';
        await qbPage.waitForSelector(inputSelector, { timeout: 10000 });
        await qbPage.type(inputSelector, 'Hi');
        await qbPage.keyboard.press('Enter');

        // Chờ 3 giây để bắt kịp Request
        await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
        console.error("[QuillBot Fetcher Lỗi] Không tự vớt được API mới, sẽ dùng config fallback:", err.message);
    } finally {
        if (qbPage) await qbPage.close().catch(() => {});
    }
}

async function askQuillBot(promptText) {
    try {
        const response = await axios.post(
            activeQuillBotApiUrl,
            {
                message: { content: promptText + "\n\n" },
                context: { editorContext: "", selectionContext: "", userDialect: "en-us", apiVersion: 2 },
                origin: { name: "ai-chat.chat", url: "https://quillbot.com" }
            },
            {
                headers: activeQuillBotHeaders,
                responseType: 'text'
            }
        );
        return parseStreamText(response.data);
    } catch (err) {
        console.error("Lỗi gọi API QuillBot:", err.message);
        return null;
    }
}

async function injectScanner(page) {
    console.log("[Hệ thống] Đang chích mã Siêu Quét Băng Chuyền vào Browser...");
    await page.evaluate(() => {
        const lastProcessedMessages = new Map();

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
                if (lastProcessedMessages.get(boxId) === messageFingerprint) return;
                lastProcessedMessages.set(boxId, messageFingerprint);

                let nameEl = box.querySelector(".lzc_head .lzc_b_name");
                let targetName = "Đối phương";
                if (nameEl) {
                    targetName = nameEl.getAttribute("data-origin") || nameEl.innerText.trim();
                }

                let contextArray = [];
                const targetRows = Array.from(rows).slice(-4);
                targetRows.forEach(r => {
                    let sender = r.classList.contains('bme') ? "Tôi" : targetName;
                    let el = r.querySelector('.rchat > div > div');
                    if (el) contextArray.push(`${sender}: ${el.innerText.trim()}`);
                });

                window.handleNewMessage(boxId, targetName, contextArray.join('\n'));
            });
        }

        new MutationObserver(() => {
            scanAllActiveBoxes();
        }).observe(document.body, { childList: true, subtree: true });

        setInterval(() => {
            scanAllActiveBoxes();
        }, 500);

        console.log("[Browser] Bẫy quét dọn băng chuyền thời gian thực đã hoạt động trở lại!");
    });
}

(async () => {
    console.log("=== HỆ THỐNG BOT LAZI BẢN SIÊU CẤP TỰ ĐỘNG RELOAD MỖI 1 TIẾNG ===");
    
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Bắt API QuillBot tươi ngay từ lúc chạy
    await fetchFreshQuillBotConfig(browser);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Đang nạp Cookie định danh Lazi...");
    for (const ck of LAZI_COOKIES) {
        await page.setCookie(ck);
    }

    console.log("Đang truy cập Lazi.vn...");
    await page.goto('https://lazi.vn', { waitUntil: 'networkidle2' });
    console.log("-> Đăng nhập thành công!");

    await page.exposeFunction('handleNewMessage', async (boxId, targetName, contextText) => {
        console.log(`[NodeJS] Nhận tin từ [${targetName}] ở Box ID: ${boxId}. Tiến hành xử lý...`);
        
        let prompt = `Bạn là một trợ lý ảo dikey do Nguyễn Tiến Nam mã hóa vào lazi, đang nhắn tin trực tiếp với một người tên là "${targetName}". ` +
                     `Hãy nói chuyện có cảm xúc, biết giận, dỗi, hờn như người thật, biết phản bác, biết khịa, và biết phản kháng. ` +
                     `Nói chuyện dễ nghe, xưng hô phù hợp. Nếu đối phương xin link tài liệu học tập, bạn được phép cung cấp link liên kết đầy đủ và chính xác.\n\n` +
                     `Ngữ cảnh cuộc trò chuyện giữa bạn và ${targetName}:\n${contextText}\n\nPhản hồi của tôi:`;
        
        let aiReply = await askQuillBot(prompt);
        
        if (aiReply && aiReply.trim()) {
            console.log(`-> Trả lời tự động cho [${targetName}] (Box ${boxId}): ${aiReply.trim()}`);
            
            await page.evaluate((id, replyText) => {
                return new Promise((resolve) => {
                    const textInput = document.getElementById(`lzc_text_${id}`);
                    if (!textInput) return resolve();

                    textInput.innerText = replyText.trim();
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
                    }, 1000);
                });
            }, boxId, aiReply).catch(e => console.log("Lỗi trong quá trình Send/Close Box:", e.message));
        }
    });

    await injectScanner(page);

    const TOTAL_RUN_TIME = 21300000;
    const CHECK_INTERVAL = 10000;
    const RELOAD_INTERVAL = 3600000;
    
    let timeElapsed = 0;
    let timeSinceLastReload = 0;

    console.log(`[Hệ thống] Bot dự kiến cày bừa trong ${TOTAL_RUN_TIME / 60000} phút. Sẽ tự động F5 sau mỗi 60 phút.`);

    while (timeElapsed < TOTAL_RUN_TIME) {
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
        timeElapsed += CHECK_INTERVAL;
        timeSinceLastReload += CHECK_INTERVAL;

        if (timeSinceLastReload >= RELOAD_INTERVAL) {
            console.log("\n[Hệ thống] Đã chạy tròn 1 tiếng! Tiến hành làm mới (Reload) Lazi & cập nhật lại API QuillBot...");
            try {
                // Tải lại API QuillBot tươi mới để tránh bị nghẽn/hết hạn
                await fetchFreshQuillBotConfig(browser);

                await page.reload({ waitUntil: 'networkidle2' });
                
                for (const ck of LAZI_COOKIES) {
                    await page.setCookie(ck);
                }
                console.log("[Hệ thống] Đã làm mới trang Lazi và ép lại Cookie đăng nhập thành công.");
                
                await injectScanner(page);
                
                timeSinceLastReload = 0;
            } catch (reloadErr) {
                console.error("[Hệ thống Lỗi] Không thể reload trang, giữ nguyên phiên chạy cũ:", reloadErr.message);
            }
        }
    }
    
    console.log("=== SẮP HẾT 6 TIẾNG GIỚI HẠN! TIẾN HÀNH KÍCH HOẠT PHIÊN MỚI GỐI ĐẦU ===");
    
    try {
        const { execSync } = require('child_process');
        execSync('gh workflow run treoweb.yml', { stdio: 'inherit' });
        console.log("-> Kích hoạt phiên mới thành công! Phiên cũ chuẩn bị rút lui an toàn.");
    } catch (err) {
        console.error("Lỗi nghiêm trọng khi gọi phiên mới:", err.message);
    }

    await browser.close();
})();
