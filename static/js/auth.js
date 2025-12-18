// 统一的登录状态检查函数
function checkLoginStatus() {
    // 优先检查token
    const token = localStorage.getItem('elderly_vue_token');
    if (token) {
        // 有token时同步到userInfo，保持兼容性
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        userInfo.token = token;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        return true;
    }
    
    // 检查userInfo中的token
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo && userInfo.token) {
        localStorage.setItem('elderly_vue_token', userInfo.token);
        return true;
    }
    
    return false;
}

// 统一登录处理
async function handleLogin(email, password) {
    try {
        // 使用本地用户管理器进行登录
        const result = userManager.login(email, password);

        if (result.success) {
            const token = result.data.token;
            const userData = result.data.user;

            // 同时更新两种存储方式，保持兼容性
            localStorage.setItem('elderly_vue_token', token);

            // 构建完整的用户信息
            const userInfo = {
                token: token,
                id: userData.id,
                realName: userData.realName,
                email: userData.email,
                phone: userData.phone,
                userType: userData.userType,
                address: userData.address,
                regTime: userData.createdAt ? new Date(userData.createdAt).toLocaleString() : '',
                lastLogin: new Date().toLocaleString(),
                serviceCount: userData.serviceCount || 0
            };

            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            return { success: true, data: userInfo };
        }
        return { success: false, message: result.message || '登录失败' };
    } catch (error) {
        console.error('登录失败:', error);
        return { success: false, message: '登录过程中发生错误，请重试' };
    }
}

// 统一退出登录
function handleLogout() {
    // 使用本地用户管理器登出
    userManager.logout();

    // 清除本地存储（保持兼容性）
    localStorage.removeItem('userInfo');
    localStorage.removeItem('elderly_vue_token');

    // 刷新页面
    window.location.reload();
}

// 导出到全局
window.checkLoginStatus = checkLoginStatus;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;