// auth.js
const SECRET_SALT = "Persona_Ins_Secret_2026_XQ"; // 私有加盐密钥，不要告诉别人

// 密码学：计算 SHA-256 哈希
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 校验邀请码是否合法 (前6位随机码 + 后6位签名)
async function verifyInviteCode(code) {
    if (!code || code.length !== 12) return false;
    const randomPart = code.substring(0, 6);
    const signature = code.substring(6, 12);
    const expectedHash = await sha256(randomPart + SECRET_SALT);
    return expectedHash.substring(0, 6).toUpperCase() === signature;
}

// 注册逻辑
async function handleRegister(username, password, inviteCode) {
    if (!username || !password || !inviteCode) return { success: false, msg: '请填写完整信息' };
    
    // 1. 校验邀请码真伪
    const isValid = await verifyInviteCode(inviteCode);
    if (!isValid) return { success: false, msg: '邀请码无效或格式错误' };

    // 2. 校验一次性 (基于本地缓存)
    let usedCodes = JSON.parse(localStorage.getItem('usedCodes')) || [];
    if (usedCodes.includes(inviteCode)) return { success: false, msg: '该邀请码已被使用' };

    // 3. 检查账号是否已存在
    let users = JSON.parse(localStorage.getItem('appUsers')) || {};
    if (users[username]) return { success: false, msg: '该账号已被注册' };

    // 4. 注册成功，记录数据
    users[username] = password; // 纯前端演示，明文存储在本地
    usedCodes.push(inviteCode);
    localStorage.setItem('appUsers', JSON.stringify(users));
    localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
    
    return { success: true, msg: '注册成功' };
}

// 登录逻辑
function handleLogin(username, password) {
    if (!username || !password) return { success: false, msg: '请填写账号和密码' };
    
    let users = JSON.parse(localStorage.getItem('appUsers')) || {};
    if (users[username] && users[username] === password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', username);
        return { success: true, msg: '登录成功' };
    }
    return { success: false, msg: '账号或密码错误' };
}

// 退出登录
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}