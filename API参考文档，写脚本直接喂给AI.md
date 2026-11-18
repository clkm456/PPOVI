# PPOVI 脚本 API 参考文档

> 本文档是 PPOVI 自动化脚本引擎（JavaScript / Rhino）的完整 API 参考，
> 可直接复制给其他 AI 工具，让它按照本 API 编写脚本。

---

## 通用规则

- 脚本语言是 **JavaScript**（Rhino 引擎），全局函数直接调用，**不需要 import**。
- 坐标单位 = **真实屏幕像素**，屏幕左上角为 `(0,0)`。
- 数字参数直接写 JS 数字，如 `click(540, 1200)`。
- `console.log(...)` 输出到日志面板；`toastLog(...)` 输出到日志面板并弹系统提示。
- 停止脚本：`exit()`；脚本也可由悬浮窗「停止」按钮随时中断（主脚本与所有子线程一并停止）。
- 开发页控制台右上角有「**复制日志**」按钮，可一键复制全部执行日志。

---

## 1. 基础操作

| 函数 | 说明 | 示例 |
|---|---|---|
| `sleep(ms)` | 阻塞等待毫秒 | `sleep(1500)` |
| `toastLog(msg)` | 弹 Toast + 写日志 | `toastLog("登录成功")` |
| `console.log(...)` | 只写日志面板（可拼多个参数） | `console.log("x=" + x)` |
| `home()` | 回到桌面，返回布尔 | `home()` |
| `back()` | 返回键，返回布尔 | `back()` |
| `exit()` | 立即结束脚本 | `exit()` |

---

## 2. 触控

| 函数 | 说明 |
|---|---|
| `click(x, y)` | 点击坐标（带 ±10px 随机抖动，拟人化），返回布尔 |
| `longClick(x, y)` | 长按 600ms，返回布尔 |
| `swipe(x1, y1, x2, y2[, duration])` | 直线滑动；`duration` 省略默认 300ms |

```js
click(540, 1200);
longClick(300, 800);
swipe(720, 1600, 720, 600, 400);   // 从下往上滑 400ms
```

---

## 3. 设备 / 应用

```js
var w = device.width;    // 屏幕宽（真实像素）
var h = device.height;   // 屏幕高（真实像素）
device.wakeUp();         // 点亮屏幕，返回布尔

app.launchPackage("com.tencent.mm");  // 按包名启动应用，返回布尔
app.killApp("com.tencent.mm");        // 结束后台进程，返回布尔
```

`app.killApp(pkg)` 说明：

- 只能杀**后台/缓存**进程；目标 App 若在前台，需先 `home()` 把它切到后台再杀。
- 尽力而为：带前台服务/闹钟的 App 可能被系统重新拉起。
- 典型用法：`app.launchPackage(...)` → 干活 → `home()` → `app.killApp(...)`。

---

## 4. 文本 / 节点查找（选择器）

四个选择器函数，均返回选择器对象：

- `text(s)` —— 匹配 `node.text` 或 `contentDescription` 包含 s
- `textContains(s)` —— 仅匹配 `node.text` 包含 s
- `id(s)` —— 按 `resource-id` 匹配（支持全名或短名）
- `desc(s)` —— 仅匹配 `contentDescription` 包含 s

选择器对象的方法：

| 方法 | 返回 | 说明 |
|---|---|---|
| `.exists()` | 布尔 | 当前屏幕是否有匹配（立即判断，不等） |
| `.findOne([timeout])` | 节点对象 或 **null** | 默认等 5 秒；超时返回 null |
| `.click()` | 布尔 | 立即找并点击第一个，找不到返回 false |

```js
// 直接链式点（安全：找不到返回 false，不抛异常）
text("登录").click();
id("btn_ok").click();
desc("关闭").click();

// 带等待 + 判空
var btn = text("确定").findOne(5000);
if (btn != null) { btn.click(); }

// 判断是否存在
if (textContains("余额").exists()) { toastLog("有余额"); }
```

> ⚠️ 注意：全局选择器 `text("x").findOne()` 找不到会返回 **null**，必须判空。
> 微信等自绘界面（文字画进像素、不暴露节点）用这些选择器取不到，改走第 8 节的找图/找色/坐标。

---

## 5. 节点对象（findOne 的返回值）

| 方法 | 返回 | 说明 |
|---|---|---|
| `.exists()` | 布尔 | 节点是否存在 |
| `.text()` | 字符串 | 节点文字 |
| `.id()` | 字符串 | resource-id |
| `.desc()` | 字符串 | contentDescription |
| `.childCount()` | 数字 | 子节点数量 |
| `.click()` | 布尔 | 点击节点中心 |
| `.bounds()` | 对象 | 边界对象，见下 |
| `.parent()` | 节点对象 | 父节点（没有则返回空对象） |
| `.child(i)` | 节点对象 | 第 i 个子节点（越界返回空对象） |
| `.setText(str)` | 布尔 | 向该节点写文本（覆盖原内容） |
| `.findOne(selector)` | 节点对象 | 子树内找第一个匹配（找不到返回空对象） |
| `.find(selector)` | 节点数组 | 子树内找全部匹配 |
| `.text(t)` / `.id(i)` | 节点对象 | 子树内按文字/id 查找（兼容写法） |

`bounds()` 返回的对象：

| 属性/方法 | 说明 |
|---|---|
| `.left` `.top` `.right` `.bottom` | 边界坐标 |
| `.centerX()` `.centerY()` | 中心坐标 |
| `.width()` `.height()` | 宽高 |

```js
var o = text("订单").findOne(5000);
if (o != null) {
    var b = o.bounds();
    console.log(b.left, b.top, b.right, b.bottom);
    click(b.centerX(), b.centerY());          // 点中心
    o.parent().click();                        // 点父节点
    o.child(1).click();                        // 点第 2 个子节点
    o.setText("你好");                          // 往该节点写文字
    var kids = o.find(textContains("￥"));      // 子树内找所有含￥的
    for (var i = 0; i < kids.length; i++) kids[i].click();
}
```

---

## 6. 输入 / 剪贴板

| 函数 | 说明 |
|---|---|
| `setText(str)` | 写入**当前有输入焦点**的输入框（整段覆盖），返回布尔 |
| `setClip(str)` | 复制文字到系统剪贴板 |
| `getClip()` | 读取剪贴板文字，空则返回 `""` |

```js
text("搜索框").click();   // 先聚焦
sleep(500);
setText("PPOVI 自动化");  // 再打字

setClip("复制我");
var s = getClip();        // s == "复制我"
```

---

## 7. 截屏保存（做找图模板用）

| 函数 | 返回 | 说明 |
|---|---|---|
| `captureScreen(path)` | 字符串 或 **null** | 截取当前屏幕保存为 PNG，返回保存路径；失败返回 null |

```js
var p = captureScreen("/sdcard/PPOVI/img/screen.png");
if (p != null) { toastLog("已保存: " + p); }
```

- `path` 是**绝对路径**；目录不存在会自动创建。
- Android 11+ 保存到任意 `/sdcard` 文件夹需先开启「所有文件访问」权限（见第 12 节），
  否则返回 null。

---

## 8. 找图 / 找色（游戏 & 自绘界面核心）

| 函数 | 返回 | 说明 |
|---|---|---|
| `findImage(path[, threshold][, region])` | `{x, y}` 或 **null** | 模板匹配，threshold 默认 0.9 |
| `findImageUntil(path, timeout)` | `{x, y}` 或 null | 轮询等待出现（约每 1 秒一次） |
| `findColor(color[, tolerance][, region])` | `{x, y}` 或 null | 找第一个颜色点，容差默认 5 |
| `findAllColors(color[, tolerance][, region])` | `{x,y}[]` 数组 | 找所有颜色点 |

参数说明：

- `path`：模板 PNG 绝对路径，如 `"/sdcard/PPOVI/img/start.png"`。**可放在任意文件夹**，
  但 Android 11+ 需「所有文件访问」权限（第 12 节）。
- `threshold`：0~1 相似度，越大越严格；默认 0.9，画面有缩放/模糊时降到 0.8
- `color`：`"#RRGGBB"` 格式
- `tolerance`：颜色容差 0~255，默认 5（主题色不是纯白/纯黑时可适当调大，如 `30`）
- `region`：`[x, y, w, h]` 限定搜索区域，省略 = 全屏
- 返回点 `{x, y}` 与 `click(x, y)` 坐标通用，用 `p.x` / `p.y` 取值

```js
var p = findImage("/sdcard/PPOVI/img/start.png");
if (p != null) click(p.x, p.y);

var p2 = findImageUntil("/sdcard/PPOVI/img/btn.png", 15000);   // 最多等 15 秒
if (p2 == null) { toastLog("没等到按钮"); exit(); }
click(p2.x, p2.y);

var c = findColor("#FF3B30");
if (c != null) click(c.x, c.y);

var coins = findAllColors("#FFD700", 10, [0, 0, 720, 1280]);
for (var i = 0; i < coins.length; i++) click(coins[i].x, coins[i].y);
```

> 微信/游戏这类「文字画进像素、不暴露节点」的界面，就靠本节 + `click(x, y)` 完成自动化。

---

## 9. 调试

| 函数 | 说明 |
|---|---|
| `dumpTree()` | 打印当前窗口整棵无障碍节点树到日志（排查「识别不到」的第一工具） |

```js
app.launchPackage("com.example.game");
sleep(5000);
dumpTree();   // 看游戏到底暴露了哪些节点；空树/无 text 说明是自绘界面，改走找图
```

---

## 10. 多线程（Auto.js 风格）

| 函数 | 返回 | 说明 |
|---|---|---|
| `threads.start(fn)` | Java Thread 或 null | 开子线程运行 JS 函数，共享主脚本全局作用域 |
| `threads.shutDownAll()` | 无 | 打断本轮脚本开的全部子线程 |
| `threads.currentThread()` | Java Thread | 当前线程对象（自省用） |

```js
threads.start(function () {
    while (true) {
        console.log("子线程还在跑");
        sleep(1000);
    }
});

sleep(5000);
threads.shutDownAll();   // 停止上面的死循环
console.log("已停止子线程");
```

> 子线程与主脚本生命周期绑定：主脚本结束（含 `exit()` 或被手动停止）时会自动打断所有子线程。

---

## 11. `auto.*` 前缀版（兼容旧 Auto.js 写法，可选）

全局函数与 `auto.*` 二选一均可：

```js
auto.click(x, y);
auto.swipe(x1, y1, x2, y2);        // 固定 300ms
auto.randomSwipe(x1, y1, x2, y2);  // 拟人贝塞尔滑动
auto.sleep(ms);
auto.toast("提示");

auto.text("登录").click();          // findOne() 永不返回 null（返回空对象）
auto.text("加载中").waitFor(5000);  // 等待出现，返回布尔
auto.textContains("登").exists();
auto.id("btn_ok").findOne();
auto.desc("关闭").click();
auto.clickText("确定");             // 快捷：找到并点
auto.existsText("余额");            // 快捷：判断是否存在
auto.waitForText("完成", 5000);     // 快捷：等文字
auto.findAllText("￥");             // 快捷：返回数组
```

> 注意：`auto.text("x").findOne()` **永不返回 null**（找不到返回空对象，用 `.exists()` 判断）；
> 而全局 `text("x").findOne()` 找不到返回 **null**。

---

## 12. 需要的系统权限

| 权限 | 用途 | 开启方式 |
|---|---|---|
| 无障碍服务 | 读节点、模拟点击/滑动、截图 | 系统设置 → 无障碍 → PPOVI |
| **所有文件访问** | `findImage` 读任意文件夹模板、`captureScreen` 存任意文件夹 | 侧边栏 → 所有文件访问（Android 11+） |
| 悬浮窗 | 悬浮控制台 | 侧边栏 → 悬浮窗 |
| 通知读取 / 使用统计 | 通知感知、判断前台应用（可选） | 侧边栏对应开关 |

> Android 10 及以下读 `/sdcard` 只需旧存储权限；Android 11+ 必须开「所有文件访问」。

---

## 13. 两个重要区别

1. **全局选择器 `text("x").findOne()` 找不到会返回 `null`** —— 必须 `if (obj != null)` 判空；
   而 **`auto.text("x").findOne()` 永不返回 null**（返回空对象，用 `.exists()` 判断）。

2. **全局 `setText(str)`** = 写入「当前有输入焦点」的输入框（需先点一下聚焦）；
   **节点 `obj.setText(str)`** = 写入指定节点（不需要聚焦）。

### 附：脚本怎么被停下来

脚本运行与停止由进程级 `ScriptRunner` 统一管理，**同时只跑一个脚本**。以下任意一处都能立即停掉当前任务：

| 停止入口 | 说明 |
| --- | --- |
| 开发页「停止任务 / 停止运行」按钮 | 正在跑别的脚本（如定时任务）时显示「停止任务」 |
| 脚本列表对应卡片的「停止」 | 跑到哪个脚本，哪个卡片显示「运行中…」 |
| 悬浮窗控制台的「停止」 | 悬浮窗常驻时可用 |
| 通知栏「停止」 | 定时任务在不看屏幕时触发，下拉通知栏直接停 |

停止是**双重中断**：`Thread.interrupt()` + Rhino 指令观测（每 1 万条指令查一次停止标志），
所以长 `sleep` 和死循环都能被打断，并在日志里输出「■ 脚本已被手动停止」。

**定时任务同样走这条链路**：定时任务触发时会把任务名登记为当前运行脚本（来源标为「定时任务」），
队列里每切到一个脚本就更新一次名称；被停止时队列不会再启动剩余脚本。

---

## 14. 完整示例

### 普通 App 签到脚本

```js
app.launchPackage("com.example.app");
sleep(4000);

var btn = text("签到").findOne(8000);
if (btn != null) {
    btn.click();
    toastLog("签到成功");
} else {
    toastLog("没找到签到按钮");
}
exit();
```

### 微信类自绘界面脚本（找图 + 坐标）

```js
// 前提：先把要点的按钮截屏裁剪成模板，放进 /sdcard/PPOVI/img/
app.launchPackage("com.tencent.mm");
sleep(8000);

// 用找图定位并点击
var tab = findImageUntil("/sdcard/PPOVI/img/tab_contact.png", 15000);
if (tab == null) { toastLog("没找到通讯录"); exit(); }
click(tab.x, tab.y);

// 找色定位红点
var red = findColor("#FA5151");
if (red != null) click(red.x, red.y);

// 写死坐标（固定布局）
click(540, 1900);
swipe(540, 1600, 540, 600, 400);   // 上滑
```

### 游戏脚本（坐标 + 找图 + 截屏）

```js
var W = device.width, H = device.height;

app.launchPackage("com.example.game");
sleep(5000);

captureScreen("/sdcard/PPOVI/img/game_home.png");   // 截屏留档/做模板

var start = findImageUntil("/sdcard/PPOVI/img/start.png", 15000);
if (start != null) click(start.x, start.y);

sleep(2000);
click(W * 0.5, H * 0.85);
longClick(W * 0.3, H * 0.5);
swipe(W * 0.7, H * 0.6, W * 0.3, H * 0.6, 400);
```

---

## 给其他 AI 的提示词模板

> 请用以上 PPOVI API 帮我写一个 JavaScript 自动化脚本。
> 需求是：[填写需求]。
> 脚本里只能用上面列出的函数，坐标用真实像素，找不到的元素用 null 判空；
> 如果目标界面是微信等自绘界面，优先用 findImage / findColor / click(x,y) 而不是 text 选择器。
