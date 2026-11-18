// ==========================================
// QQ 盲盒签 - 最终全自动发布版 (高稳修复)
// ==========================================

var w = device.width;
var h = device.height;
var imgZhankai = "/storage/emulated/0/PPOVI/img/zhankai.jpg"; 
var taskName = "盲盒签";

toastLog("🚀 启动 QQ...");
home();
sleep(1000);
app.launchPackage("com.tencent.mobileqq");
sleep(2500); 

// 1. 进入账号信息页
toastLog("👉 右滑呼出侧边栏...");
swipe(w * 0.1, h * 0.5, w * 0.7, h * 0.5, 200);
sleep(1500); 

toastLog("🎯 点击头像区域进入账号信息...");
click(367, 963);
sleep(2500); 

toastLog("🎯 盲点【额外活跃】天数...");
click(863, 1594);
sleep(1500);

// 2. 展开列表
toastLog("👉 初始动作：先向上滑动一次...");
swipe(w * 0.5, h * 0.7, w * 0.5, h * 0.5, 400);
sleep(1500); 

toastLog("🔍 开始循环寻找【展开】按钮...");
var foundZhankai = false;
for (var i = 0; i < 5; i++) {
    var point = findImage(imgZhankai, 0.7);
    if (point != null) {
        click(point.x, point.y);
        foundZhankai = true;
        break; 
    } else {
        swipe(w * 0.5, h * 0.7, w * 0.5, h * 0.5, 400);
        sleep(1500); 
    }
}
if (!foundZhankai) click(w * 0.5, h * 0.77); 
sleep(2000); 

// ==========================================
// 3. 下滑找盲盒签 (节点精准定位)
// ==========================================
toastLog("🔍 开始下滑寻找【" + taskName + "】任务...");
var foundTask = false;

for (var j = 0; j < 8; j++) {
    toastLog("第 " + (j + 1) + " 次屏幕扫描...");
    
    var taskNode = textContains(taskName).findOne(1000);
    if(taskNode == null) taskNode = desc(taskName).findOne(1000);
    
    if (taskNode != null) {
        toastLog("✅ 找到【" + taskName + "】文字节点！");
        var taskBounds = taskNode.bounds();
        
        // 优先找父节点里的“去完成”，找不到就点文字最右侧边缘
        var btnNode = null;
        var parent = taskNode.parent();
        if(parent != null) {
            btnNode = parent.findOne(text("去完成"));
            if(btnNode == null) btnNode = parent.findOne(desc("去完成"));
        }
        
        if (btnNode != null) {
            click(btnNode.bounds().centerX(), btnNode.bounds().centerY());
        } else {
            click(taskBounds.right + 100, taskBounds.centerY());
        }
        
        foundTask = true;
        toastLog("⏳ 已点击，等待 H5 页面加载...");
        sleep(6000);
        break; 
    }
    
    toastLog("⚠️ 没找到，向下滑动一截继续找...");
    swipe(w * 0.5, h * 0.8, w * 0.5, h * 0.4, 500);
    sleep(1500); 
}

// ==========================================
// 4. 核心判定：找不到直接结束
// ==========================================
if (!foundTask) {
    toastLog("🛑 盲盒签任务已完成或未找到，提前结束运行！");
    exit(); 
}

// ==========================================
// 5. H5页面 -> 说说编辑 -> 输入内容 -> 权限 -> 设置
// ==========================================
toastLog("🔍 正在寻找【保存并发布】按钮...");
var publishBtn = text("保存并发布").findOne(3000);

if (publishBtn != null) {
    toastLog("✅ 找到【保存并发布】按钮，点击进入编辑页！");
    click(publishBtn.bounds().centerX(), publishBtn.bounds().centerY());
    sleep(4000); 
    
    // 👉 点击输入框并输入 1
    toastLog("👉 正在点击输入框并输入文字...");
    click(w * 0.5, h * 0.25); 
    sleep(1500);
    setText("1");
    sleep(1500);
    back(); // 收起键盘
    sleep(2000); // 稍微多等一会儿，确保键盘完全收起且页面稳定

    // 👉 修改权限为“私密” (连点两次)
    toastLog("👉 正在尝试修改说说权限...");
    var currentPermission = text("所有人可见").findOne(2000);
    
    if (currentPermission != null) {
        var clickableArea = currentPermission.parent();
        var pX = clickableArea.bounds().centerX();
        var pY = clickableArea.bounds().centerY();
        
        click(pX, pY); sleep(1500); 
        click(pX, pY); sleep(2000); 
        
        var privateOption = text("私密").findOne(2000);
        if (privateOption != null) {
            click(privateOption.bounds().centerX(), privateOption.bounds().centerY());
            sleep(1500); 
            
            var doneBtn = text("完成").findOne(2000);
            if (doneBtn != null) {
                click(doneBtn.bounds().centerX(), doneBtn.bounds().centerY());
                sleep(2000);
            }
        }
    }

    // 👉 设置 24小时后自动删除
    toastLog("👉 正在寻找【发表设置】...");
    var settingsNode = text("发表设置").findOne(3000);
    
    if (settingsNode != null) {
        var clickableParent = settingsNode.parent();
        if (clickableParent != null) {
            click(clickableParent.bounds().centerX(), clickableParent.bounds().centerY());
        } else {
            click(settingsNode.bounds().centerX(), settingsNode.bounds().centerY());
        }
        sleep(2500); 
        
        var deleteNode = text("发表24小时后自动删除").findOne(2000);
        if (deleteNode != null) {
            click(parseInt(w * 0.85), deleteNode.bounds().centerY());
            sleep(2000); 
            
            var confirmBtn = text("确认").findOne(2000);
            if (confirmBtn != null) {
                click(confirmBtn.bounds().centerX(), confirmBtn.bounds().centerY());
                sleep(1500);
            }
        }
        
        // 👉 返回说说编辑页
        var backBtn = desc("返回").findOne(2000);
        if(backBtn != null){
            click(backBtn.bounds().centerX(), backBtn.bounds().centerY());
        } else {
            back(); 
        }
        sleep(2000);
    }
    
    // ==========================================
    // 6. 最终临门一脚：点击【发表】
    // ==========================================
    toastLog("🚀 准备发送！正在寻找右上角【发表】按钮...");
    var submitBtn = text("发表").findOne(3000);
    
    if (submitBtn != null) {
        toastLog("✅ 找到【发表】按钮！执行点击！");
        click(submitBtn.bounds().centerX(), submitBtn.bounds().centerY());
        sleep(4000); 
        
        if(text("确定").exists()) text("确定").findOne().click();
        if(text("知道了").exists()) text("知道了").findOne().click();
        
        toastLog("🎉 任务大圆满！盲盒签已成功发表。");
    } else {
        toastLog("⚠️ 没找到【发表】文字，执行右上角物理盲点兜底...");
        click(parseInt(w * 0.9), parseInt(h * 0.08));
        sleep(4000);
        if(text("确定").exists()) text("确定").findOne().click();
        if(text("知道了").exists()) text("知道了").findOne().click();
        toastLog("🎉 盲点发送完毕！");
    }
} else {
    toastLog("❌ 没找到【保存并发布】按钮。");
}

// ==========================================
// 7. 收尾：连续五次返回 + 强制回主界面
// ==========================================
toastLog("🔄 任务完成，开始连续执行 5 次返回操作...");
for (var k = 0; k < 5; k++) {
    back();
    sleep(1000); 
}

toastLog("🛡️ 强制拉起 QQ 主界面...");
app.launchPackage("com.tencent.mobileqq"); 
sleep(2000);

toastLog("🎉 盲盒签任务全部处理完毕，已稳稳停在 QQ 主页！");
