// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function () {
    autoLogin(); // 添加自动登录功能
    checkLoginStatus();
    initializeForgotPassword();
});

// 自动登录功能
function autoLogin() {
    const token = localStorage.getItem('elderly_vue_token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (token && userInfo && userInfo.realName) {
        console.log('检测到登录状态，自动登录中...');

        // 更新页面状态
        document.body.classList.add('logged-in');

        // 更新用户信息显示
        if (document.getElementById('userNameDisplay')) {
            document.getElementById('userNameDisplay').textContent = userInfo.realName || '用户';
        }

        // 更新欢迎信息
        if (document.getElementById('welcomeMessage')) {
            document.getElementById('welcomeMessage').textContent =
                `欢迎回来，${userInfo.realName}！为您提供专属养老服务`;
        }

        // 更新用户信息卡片
        if (document.getElementById('userWelcomeName')) {
            document.getElementById('userWelcomeName').textContent = userInfo.realName || '用户名称';
        }

        // 设置用户头像首字母
        if (userInfo.realName && document.querySelector('.user-avatar')) {
            const avatarLetter = userInfo.realName.charAt(0);
            document.querySelector('.user-avatar').innerHTML = `<span>${avatarLetter}</span>`;
        }

        console.log('自动登录成功');
    }
}

// 检查登录状态
function checkLoginStatus() {
    // 从localStorage获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = localStorage.getItem('elderly_vue_token');

    if (userInfo && token && userInfo.realName) {
        // 用户已登录
        document.body.classList.add('logged-in');
        renderUserInfo(userInfo);

        // 验证token有效性（实际项目中应该调用后端接口验证）
        verifyToken(token);
    } else {
        // 用户未登录
        document.body.classList.remove('logged-in');
        // 清除可能残留的用户信息
        if (!token || !userInfo.realName) {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('elderly_vue_token');
        }
    }
}

// 渲染用户信息
function renderUserInfo(userInfo) {
    // 更新导航栏用户名
    if (document.getElementById('userNameDisplay')) {
        document.getElementById('userNameDisplay').textContent = userInfo.realName || '用户';
    }

    // 更新欢迎信息
    if (document.getElementById('welcomeMessage')) {
        document.getElementById('welcomeMessage').textContent =
            `欢迎回来，${userInfo.realName}！为您提供专属养老服务`;
    }

    // 更新用户信息卡片
    if (document.getElementById('userWelcomeName')) {
        document.getElementById('userWelcomeName').textContent = userInfo.realName || '用户名称';
    }

    // 根据用户类型显示不同文本
    const userTypeMap = {
        'elderly': '老年人用户',
        'family': '家属用户',
        'manager': '管理员'
    };
    if (document.getElementById('userTypeText')) {
        document.getElementById('userTypeText').textContent = userTypeMap[userInfo.userType] || '普通用户';
    }

    // 设置用户头像首字母
    if (userInfo.realName && document.querySelector('.user-avatar')) {
        const avatarLetter = userInfo.realName.charAt(0);
        document.querySelector('.user-avatar').innerHTML = `<span>${avatarLetter}</span>`;
    }

    // 填充其他用户信息（实际项目中这些信息应该从后端获取）
    if (document.getElementById('userRegTime')) {
        document.getElementById('userRegTime').textContent = userInfo.regTime || '未知';
    }
    if (document.getElementById('userLastLogin')) {
        document.getElementById('userLastLogin').textContent = userInfo.lastLogin || '刚刚';
    }
    if (document.getElementById('userServiceCount')) {
        document.getElementById('userServiceCount').textContent = userInfo.serviceCount || '0';
    }

    // 自动填充反馈表单的用户信息
    if (document.getElementById('feedbackName')) {
        document.getElementById('feedbackName').value = userInfo.realName || '';
    }
    if (document.getElementById('feedbackEmail')) {
        document.getElementById('feedbackEmail').value = userInfo.email || '';
    }
}

// 验证token有效性
function verifyToken(token) {
    // 使用本地用户管理器验证token
    const currentUser = userManager.getCurrentUser();

    if (!currentUser || currentUser.token !== token) {
        // Token无效或已过期，清除登录状态
        logout();
    }
}

// 退出登录
document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
    e.preventDefault();
    logout();
});

// 执行退出登录操作
function logout() {
    // 使用本地用户管理器登出
    userManager.logout();

    // 清除本地登录状态
    clearLoginState();
}

// 清除登录状态
function clearLoginState() {
    // 清除本地存储的用户信息
    localStorage.removeItem('userInfo');
    localStorage.removeItem('elderly_vue_token');

    // 更新页面状态
    document.body.classList.remove('logged-in');

    // 语音提示
    const utterance = new SpeechSynthesisUtterance('已成功退出登录');
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);

    // 如果是用户中心页面，重定向到首页
    if (window.location.pathname.includes('home.html')) {
        window.location.href = 'index.html';
    } else {
        // 刷新页面
        window.location.reload();
    }
}

// 显示登录提示
function showLoginPrompt() {
    const loginPrompt = document.getElementById('loginPrompt');
    if (loginPrompt) {
        loginPrompt.style.display = 'block';

        // 3秒后自动隐藏
        setTimeout(() => {
            loginPrompt.style.display = 'none';
        }, 3000);
    }
}

// 显示登录表单
function showLoginForm() {
    const loginFormContainer = document.querySelector('.login-form-container');
    if (loginFormContainer) {
        loginFormContainer.classList.add('active');
    }
}

// 统一的登录状态检查函数
function checkAuthStatus() {
    const token = localStorage.getItem('elderly_vue_token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    return !!(token && userInfo && userInfo.realName);
}

// 字体大小调整功能优化（修复字体不变化问题）
let fontSize = localStorage.getItem('fontSize') ? parseInt(localStorage.getItem('fontSize')) : 90;
document.documentElement.style.fontSize = `${fontSize}%`;

// 获取所有可能的字体控制按钮
const fontSizeIncrease = document.getElementById('fontSizeIncrease') || document.getElementById('font-larger');
const fontSizeDecrease = document.getElementById('fontSizeDecrease') || document.getElementById('font-smaller');
const fontSizeReset = document.getElementById('font-reset');

// 增大字体
if (fontSizeIncrease) {
    fontSizeIncrease.addEventListener('click', () => {
        if (fontSize < 160) {
            fontSize += 10;
            document.documentElement.style.fontSize = `${fontSize}%`;
            localStorage.setItem('fontSize', fontSize);
            // 语音提示
            const utterance = new SpeechSynthesisUtterance('字体已增大');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
        }
    });
}

// 减小字体
if (fontSizeDecrease) {
    fontSizeDecrease.addEventListener('click', () => {
        if (fontSize > 70) {
            fontSize -= 10;
            document.documentElement.style.fontSize = `${fontSize}%`;
            localStorage.setItem('fontSize', fontSize);
            // 语音提示
            const utterance = new SpeechSynthesisUtterance('字体已缩小');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
        }
    });
}

// 重置字体大小
if (fontSizeReset) {
    fontSizeReset.addEventListener('click', () => {
        fontSize = 90;
        document.documentElement.style.fontSize = `${fontSize}%`;
        localStorage.setItem('fontSize', fontSize);
        // 语音提示
        const utterance = new SpeechSynthesisUtterance('字体已重置为默认大小');
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
    });
}

// 高对比度模式
const highContrastBtn = document.getElementById('highContrast');
let highContrastMode = localStorage.getItem('highContrast') === 'true';

if (highContrastMode) {
    document.body.classList.add('high-contrast');
}

if (highContrastBtn) {
    highContrastBtn.addEventListener('click', () => {
        highContrastMode = !highContrastMode;
        document.body.classList.toggle('high-contrast', highContrastMode);
        localStorage.setItem('highContrast', highContrastMode);
        // 语音提示
        const utterance = new SpeechSynthesisUtterance(highContrastMode ? '已开启高对比度模式' : '已关闭高对比度模式');
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
    });
}

// 语音朗读功能
const readAloudBtn = document.getElementById('readAloud');
let isReading = false;
let speechSynthesis = window.speechSynthesis;
let utterance = null;

if (readAloudBtn) {
    readAloudBtn.addEventListener('click', () => {
        if (isReading) {
            speechSynthesis.cancel();
            isReading = false;
            readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
            return;
        }

        const visibleText = document.body.innerText.substring(0, 800);
        utterance = new SpeechSynthesisUtterance(visibleText);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        utterance.pitch = 1.2;

        speechSynthesis.speak(utterance);
        isReading = true;
        readAloudBtn.innerHTML = '<i class="fas fa-volume-mute"></i> 停止朗读';

        utterance.onend = () => {
            isReading = false;
            readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
        };
    });
}

// 用户类型选择
const userTypeOptions = document.querySelectorAll('.user-type-option');
userTypeOptions.forEach(option => {
    option.addEventListener('click', () => {
        userTypeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

// 登录表单处理
const loginForm = document.getElementById('loginForm');
const loginSuccess = document.getElementById('loginSuccess');

if (loginForm) {
    loginForm.addEventListener('submit',
        async function (event) {
            const loginBtn = this.querySelector('input[type="submit"]');
            const loginError = document.getElementById('loginError');
            event.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // 简单验证
            if (email === '' || password === '') {
                loginError.textContent = '请填写邮箱和密码';
                loginError.style.display = 'block';

                const utterance = new SpeechSynthesisUtterance('请填写邮箱和密码');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);
                return;
            }

            try {
                // 发送请求前的状态处理
                loginBtn.disabled = true;
                loginBtn.textContent = '登录中...';
                loginError.style.display = 'none';

                // 使用本地用户管理器进行登录
                const result = userManager.login(email, password);

                if (result.success) {
                    // 从响应数据中提取用户信息
                    const userData = result.data.user;

                    // 保存用户信息到本地存储 - 确保所有必要字段都保存
                    const userInfo = {
                        token: result.data.token,
                        id: userData.id,
                        realName: userData.realName,
                        email: userData.email,
                        phone: userData.phone,
                        userType: userData.userType,
                        address: userData.address,
                        regTime: userData.createdAt ? new Date(userData.createdAt).toLocaleString() : '',
                        lastLogin: new Date().toLocaleString(),
                        // 确保有服务计数，避免undefined
                        serviceCount: userData.serviceCount || 0
                    };

                    // 确保数据正确存储（保持兼容性）
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    localStorage.setItem('elderly_vue_token', result.data.token);

                    console.log('登录成功，用户信息已保存:', userInfo);

                    // 登录成功提示
                    loginSuccess.style.display = 'block';

                    // 语音提示
                    const utterance = new SpeechSynthesisUtterance('登录成功,即将跳转到用户中心');
                    utterance.lang = 'zh-CN';
                    window.speechSynthesis.speak(utterance);

                    let countdown = 3;
                    const countdownElement = document.getElementById('loginCountdown');
                    countdownElement.textContent = countdown;

                    const timer = setInterval(() => {
                        countdown--;
                        countdownElement.textContent = countdown;
                        if (countdown <= 0) {
                            clearInterval(timer);
                            // 统一跳转到用户中心
                            window.location.href = 'home.html';
                        }
                    }, 1000);

                    // 关闭登录表单
                    const loginFormContainer = document.querySelector('.login-form-container');
                    if (loginFormContainer) {
                        loginFormContainer.classList.remove('active');
                    }
                } else {
                    // 登录失败处理
                    loginError.textContent = result.message || '登录失败，请重试';
                    loginError.style.display = 'block';

                    const utterance = new SpeechSynthesisUtterance(result.message || '登录失败，请检查账号密码');
                    utterance.lang = 'zh-CN';
                    window.speechSynthesis.speak(utterance);
                }
            } catch (error) {
                console.error('登录过程中发生错误：', error);
                loginError.textContent = '登录过程中发生错误，请重试';
                loginError.style.display = 'block';

                const utterance = new SpeechSynthesisUtterance('登录过程中发生错误，请重试');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);

            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = '登录';
            }
        });
}

// 注册表单处理
const registerForm = document.getElementById('registerForm');
const registerSuccess = document.getElementById('registerSuccess');
const registerError = document.getElementById('registerError');

if (registerForm) {
    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // 获取表单元素和提交按钮
        const registerBtn = this.querySelector('input[type="submit"]');
        const realName = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const address = document.getElementById('registerAddress').value.trim();
        const userTypeElement = document.querySelector('.user-type-option.active');
        const userType = userTypeElement ? userTypeElement.getAttribute('data-type') : 'elderly';

        // 前端简单验证
        if (realName === '' || email === '' || phone === '' || password === '' || confirmPassword === '') {
            registerError.textContent = '请填写所有必填字段';
            registerError.style.display = 'block';

            const utterance = new SpeechSynthesisUtterance('请填写所有必填字段');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
            return;
        }

        if (password !== confirmPassword) {
            registerError.textContent = '两次输入的密码不一致';
            registerError.style.display = 'block';

            const utterance = new SpeechSynthesisUtterance('两次输入的密码不一致');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
            return;
        }

        try {
            // 发送请求前的状态处理
            registerBtn.disabled = true;
            registerBtn.value = '注册中...';
            registerError.style.display = 'none';

            // 使用本地用户管理器进行注册
            const result = userManager.register({
                realName,
                email,
                phone,
                password,
                address,
                userType
            });

            if (result.success) {
                // 注册成功逻辑
                const registerFormContainer = document.querySelector('.register-form-container');
                if (registerFormContainer) {
                    registerFormContainer.classList.remove('active');
                }

                registerSuccess.style.display = 'block';

                const utterance = new SpeechSynthesisUtterance('注册成功，即将跳转到登录页面');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);

                // 清空表单
                registerForm.reset();

                let countdown = 3;
                const countdownElement = document.getElementById('registerCountdown');
                countdownElement.textContent = countdown;

                const timer = setInterval(() => {
                    countdown--;
                    countdownElement.textContent = countdown;
                    if (countdown <= 0) {
                        clearInterval(timer);
                        registerSuccess.style.display = 'none';
                        const loginFormContainer = document.querySelector('.login-form-container');
                        if (loginFormContainer) {
                            loginFormContainer.classList.add('active');
                        }
                    }
                }, 1000);

            } else {
                // 注册失败逻辑
                registerError.textContent = result.message || '注册失败，请重试';
                registerError.style.display = 'block';

                const utterance = new SpeechSynthesisUtterance(result.message || '注册失败，请检查信息');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);
            }

        } catch (error) {
            // 异常处理
            console.error('注册请求失败：', error);
            registerError.textContent = '注册过程中发生错误，请重试';
            registerError.style.display = 'block';

            const utterance = new SpeechSynthesisUtterance('注册过程中发生错误，请重试');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);

        } finally {
            // 恢复按钮状态
            registerBtn.disabled = false;
            registerBtn.value = '注册';
        }
    });
}

// 忘记密码功能初始化
function initializeForgotPassword() {
    // 忘记密码功能变量
    let currentStep = 1;
    const totalSteps = 3;
    let countdownInterval;
    let countdown = 60;

    // 打开忘记密码表单
    function openForgotPassword() {
        document.querySelector('.forgot-password-container').classList.add('active');
        resetForgotPasswordForm();
    }

    // 关闭忘记密码表单（包含取消按钮和新增的叉号按钮）
    document.getElementById('close-forgot')?.addEventListener('click', function () {
        document.querySelector('.forgot-password-container').classList.remove('active');
        resetForgotPasswordForm();
    });

    // 新增：忘记密码框右上角叉号按钮事件
    const forgotFormClose = document.getElementById('forgot-form-close');
    if (forgotFormClose) {
        forgotFormClose.addEventListener('click', function () {
            document.querySelector('.forgot-password-container').classList.remove('active');
            resetForgotPasswordForm();
            const utterance = new SpeechSynthesisUtterance('已关闭找回密码');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
        });
    }

    // 下一步
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function () {
            const step = parseInt(this.dataset.next) - 1;
            nextStep(step);
        });
    });

    // 上一步
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function () {
            const step = parseInt(this.dataset.prev) + 1;
            prevStep(step);
        });
    });

    function nextStep(step) {
        if (validateStep(step)) {
            if (step < totalSteps) {
                document.getElementById(`step${step}`).classList.remove('active');
                document.getElementById(`step${step + 1}`).classList.add('active');

                updateProgressBar(step + 1);
                currentStep = step + 1;

                if (step === 1) {
                    sendVerificationCode();
                }
            }
        }
    }

    function prevStep(step) {
        if (step > 1) {
            document.getElementById(`step${step}`).classList.remove('active');
            document.getElementById(`step${step - 1}`).classList.add('active');

            updateProgressBar(step - 1);
            currentStep = step - 1;
        }
    }

    // 更新进度条
    function updateProgressBar(step) {
        const steps = document.querySelectorAll('.step');
        const connector = document.getElementById('stepConnector');

        steps.forEach((s, index) => {
            if (index < step) {
                s.classList.add('completed');
                s.classList.add('active');
            } else if (index === step - 1) {
                s.classList.add('active');
                s.classList.remove('completed');
            } else {
                s.classList.remove('active');
                s.classList.remove('completed');
            }
        });

        const progress = ((step - 1) / (totalSteps - 1)) * 100;
        connector.style.width = `${progress}%`;
    }

    // 验证当前步骤
    function validateStep(step) {
        let isValid = true;

        if (step === 1) {
            const email = document.getElementById('forgotEmail').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                document.getElementById('forgotEmail').parentElement.classList.add('error');
                isValid = false;
                const utterance = new SpeechSynthesisUtterance('请输入有效的邮箱地址');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);
            } else {
                document.getElementById('forgotEmail').parentElement.classList.remove('error');
            }
        }

        if (step === 2) {
            const code = document.getElementById('verificationCode').value;

            if (code.trim() === '' || code !== '123456') {
                document.getElementById('verificationCode').parentElement.parentElement.classList.add('error');
                isValid = false;
                const utterance = new SpeechSynthesisUtterance('请输入正确的验证码');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);
            } else {
                document.getElementById('verificationCode').parentElement.parentElement.classList.remove('error');
            }
        }

        if (step === 3) {
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;

            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                document.getElementById('newPassword').parentElement.classList.add('error');
                isValid = false;
                const utterance = new SpeechSynthesisUtterance('密码至少8位，需包含字母和数字');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);
            } else {
                document.getElementById('newPassword').parentElement.classList.remove('error');
            }

            if (password !== confirmPassword) {
                document.getElementById('confirmNewPassword').parentElement.classList.add('error');
                isValid = false;
                const utterance = new SpeechSynthesisUtterance('两次输入的密码不一致');
                utterance.lang = 'zh-CN';
                window.speechSynthesis.speak(utterance);
            } else {
                document.getElementById('confirmNewPassword').parentElement.classList.remove('error');
            }
        }

        return isValid;
    }

    // 发送验证码
    document.getElementById('sendCodeBtn')?.addEventListener('click', sendVerificationCode);

    function sendVerificationCode() {
        const email = document.getElementById('forgotEmail').value;
        const sendCodeBtn = document.getElementById('sendCodeBtn');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('forgotEmail').parentElement.classList.add('error');
            const utterance = new SpeechSynthesisUtterance('请输入有效的邮箱地址');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);
            return;
        } else {
            document.getElementById('forgotEmail').parentElement.classList.remove('error');
        }

        sendCodeBtn.disabled = true;
        countdown = 60;

        document.getElementById('verificationCode').parentElement.parentElement.classList.add('success');

        console.log(`验证码已发送到: ${email}`);

        const utterance = new SpeechSynthesisUtterance('验证码已发送，请查收邮件');
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);

        countdownInterval = setInterval(() => {
            countdown--;
            sendCodeBtn.textContent = `${countdown}秒后重新发送`;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                sendCodeBtn.disabled = false;
                sendCodeBtn.textContent = '发送验证码';
            }
        }, 1000);
    }

    // 忘记密码表单提交（优化跳转登录框逻辑）
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!validateStep(3)) {
                return;
            }

            const forgotContainer = document.querySelector('.forgot-password-container');
            forgotContainer.classList.remove('active');

            const resetSuccess = document.getElementById('resetSuccess');
            if (resetSuccess) resetSuccess.style.display = 'block';

            const utterance = new SpeechSynthesisUtterance('密码重置成功，即将跳转到登录页面');
            utterance.lang = 'zh-CN';
            window.speechSynthesis.speak(utterance);

            let countdown = 3;
            const countdownElement = document.getElementById('resetCountdown');
            countdownElement.textContent = countdown;

            const timer = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;

                if (countdown <= 0) {
                    clearInterval(timer);
                    if (resetSuccess) resetSuccess.style.display = 'none';
                    resetForgotPasswordForm();
                    if (loginFormContainer) {
                        loginFormContainer.classList.add('active');
                        const loginEmail = document.getElementById('loginEmail');
                        if (loginEmail) loginEmail.focus();
                    }
                }
            }, 1000);
        });
    }

    // 重置忘记密码表单
    function resetForgotPasswordForm() {
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) forgotForm.reset();

        currentStep = 1;
        updateProgressBar(1);
        clearInterval(countdownInterval);

        document.querySelectorAll('.form-step').forEach((step, index) => {
            if (index === 0) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        const sendCodeBtn = document.getElementById('sendCodeBtn');
        if (sendCodeBtn) {
            sendCodeBtn.disabled = false;
            sendCodeBtn.textContent = '发送验证码';
        }

        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            group.classList.remove('success');
        });
    }

    // 忘记密码表单切换
    const showForgotPassword = document.getElementById('show-forgot-password');
    const forgotPasswordContainer = document.querySelector('.forgot-password-container');

    if (showForgotPassword && forgotPasswordContainer) {
        showForgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginFormContainer) loginFormContainer.classList.remove('active');
            forgotPasswordContainer.classList.add('active');
        });
    }
}

// 导航菜单切换
const menuBar = document.getElementById('menu-bar');
const navbar = document.querySelector('.navbar');

if (menuBar && navbar) {
    menuBar.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });
}

// 登录表单切换（修改部分：已登录时点击直接跳转）
const loginBtnIcon = document.getElementById('login-btn');
const formClose = document.getElementById('form-close');
const loginFormContainer = document.querySelector('.login-form-container');

if (loginBtnIcon && formClose && loginFormContainer) {
    loginBtnIcon.addEventListener('click', () => {
        // 检查是否已登录
        const token = localStorage.getItem('elderly_vue_token');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        if (token && userInfo && userInfo.realName) {
            // 已登录，直接跳转到用户中心
            console.log('用户已登录，跳转到用户中心');
            window.location.href = 'home.html';
        } else {
            // 未登录，显示登录表单
            console.log('用户未登录，显示登录表单');
            loginFormContainer.classList.add('active');
        }
    });

    formClose.addEventListener('click', () => {
        loginFormContainer.classList.remove('active');
    });
}

// 注册表单切换
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const registerFormClose = document.getElementById('register-form-close');
const registerFormContainer = document.querySelector('.register-form-container');

if (showRegister && registerFormContainer) {
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.classList.remove('active');
        registerFormContainer.classList.add('active');
    });
}

if (showLogin && loginFormContainer) {
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.classList.remove('active');
        loginFormContainer.classList.add('active');
    });
}

if (registerFormClose && registerFormContainer) {
    registerFormClose.addEventListener('click', () => {
        registerFormContainer.classList.remove('active');
    });
}

// 搜索框切换
const searchBtn = document.getElementById('search-btn');
const searchBar = document.querySelector('.search-bar-container');

if (searchBtn && searchBar) {
    searchBtn.addEventListener('click', () => {
        searchBar.classList.toggle('active');
    });
}

// 轮播图初始化
const swiper = new Swiper('.review-slider', {
    loop: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        480: {
            slidesPerView: 1,
        }
    }
});

// 视差效果
const scene = document.getElementById('scene');
if (scene) {
    const parallax = new Parallax(scene);
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');

        // 检查是否是无效的选择器（只有 # 的情况）
        if (targetId === '#' || targetId === '') {
            return;
        }

        // 如果是外部链接则直接跳转
        if (targetId.includes('.html')) {
            window.location.href = targetId;
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });

            if (navbar) {
                navbar.classList.remove('active');
            }
        }
    });
});