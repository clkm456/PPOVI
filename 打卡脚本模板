// ==========================================
//  App 全自动打卡 (究极暴力重置版 - 纯打卡)
// ==========================================

var w = device.width;
var h = device.height;

toastLog("🚀 启动"自动打卡脚本");

// 1. 划一下通知栏，强制激活系统网络和 UI
// 防止手机刚唤醒时网络没连上或者渲染卡顿
toastLog("👉 唤醒系统网络与 UI...");
swipe(w*0.5, h*0.3, w*0.5, h*0.7, 500); 
sleep(1000);
swipe(w*0.5, h*0.8, w*0.5, h*0.2, 500); 
sleep(1000);

// ==========================================
// 2. 核心流程：包含“物理唤醒”的重启函数
// ==========================================
function runPunchCard() {
    toastLog("🧹 开始究极重置 App...");
    home();
    sleep(1000);
    
    // 暴力杀进程
    try { 
        app.killApp(""); 
        toastLog("✅ 杀进程成功，等待系统回收...");
    } catch(e) {}
    
    // 💡 核心改进：杀进程后等 5 秒，让安卓系统彻底清理干净内存
    sleep(5000);

    toastLog("重新打开【】...");
    app.launchPackage("");

    toastLog("正在等待首页加载...");
    var entry = null;

    // 最多等 30 秒
    for (var i = 0; i < 15; i++) { 
        entry = text("考勤打卡").findOne(2000);
        if (entry != null) {
            toastLog("✅ 成功进入首页！");
            break;
        }
        
        // 💡 物理唤醒：如果白屏了，就在屏幕中央画个圈滑动，强制触发 UI 渲染，并把可能出现的隐私弹窗点掉
        if (i > 0) {
            if (i % 3 === 0) {
                toastLog("⚠️ 疑似白屏，滑动屏幕强行唤醒渲染...");
                swipe(w*0.5, h*0.6, w*0.5, h*0.4, 400);
                sleep(500);
            }
            if (text("同意").exists()) text("同意").findOne().click();
            if (text("我知道了").exists()) text("我知道了").findOne().click();
            if (text("跳过").exists()) text("跳过").findOne().click();
        }
        sleep(1000);
    }

    if (entry == null) {
        toastLog("❌ 彻底白屏，无法进入首页。");
        return false; 
    }

    entry.click();
    sleep(4000); 

    toastLog("等待考勤定位加载...");
    var modeText = text("当前为外勤打卡模式").findOne(20000);

    if (modeText == null) {
        toastLog("❌ 进入考勤页后白屏。");
        return false; 
    }

    // 3. 执行打卡
    toastLog("✅ 准备打卡！");
    let b = modeText.bounds();
    let colorPoint = findColor("#E7734F", 30, [0, b.bottom, device.width, device.height * 0.3]); 
    
    if (colorPoint != null) {
        click(colorPoint.x, colorPoint.y);
    } else {
        click(b.centerX(), b.centerY() + 260); 
    }
    sleep(3000); 

    let confirmBtn = text("确认打卡").findOne(5000);
    if (confirmBtn != null) {
        confirmBtn.click();
    } else {
        click(device.width * 0.5, device.height * 0.65); 
    }
    sleep(4000); 
    return true; 
}

// 4. 执行重试逻辑 (最多重试 2 次)
var success = false;
for (var retry = 0; retry < 2; retry++) {
    toastLog("========== 尝试打卡 第 " + (retry + 1) + " 次 ==========");
    success = runPunchCard();
    if (success) {
        toastLog("🎉 考勤打卡成功！");
        break; 
    }
    sleep(3000);
}

toastLog("流程结束。");
home(); 
try { app.killApp(""); } catch(e) {}
exit();%
