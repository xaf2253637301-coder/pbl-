// 页面加载时检查Token
window.onload = function () {
    const token = localStorage.getItem('elderly_vue_token');
    if (token) {
        // 有Token，尝试获取用户信息
        getUserInfo();
        showUserContent();
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        // 无Token，显示登录提示
        showLoginPrompt();
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }

    // 初始化表单事件（无论登录状态如何）
    initFormEvents();
};

// 初始化所有表单事件
function initFormEvents() {
    initLoginFormEvents();
    initRegisterFormEvents();
    initForgotPasswordEvents();
    initFormToggleEvents();
}

// 初始化登录表单事件
function initLoginFormEvents() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const loginError = document.getElementById('loginError');

            if (!email || !password) {
                showLoginError('邮箱和密码不能为空');
                return;
            }

            try {
                // 使用本地用户管理器进行登录
                const result = userManager.login(email, password);

                if (result.success) {
                    // 登录成功，存储Token和用户信息
                    const userData = result.data.user;
                    const userInfo = {
                        token: result.data.token,
                        id: userData.id,
                        realName: userData.realName,
                        email: userData.email,
                        phone: userData.phone,
                        userType: userData.userType,
                        address: userData.address
                    };

                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    localStorage.setItem('elderly_vue_token', result.data.token);

                    const loginFormContainer = document.querySelector('.login-form-container');
                    if (loginFormContainer) loginFormContainer.classList.remove('active');

                    const loginSuccess = document.getElementById('loginSuccess');
                    if (loginSuccess) loginSuccess.style.display = 'block';

                    // 语音提示
                    speakMessage('登录成功，正在加载用户信息');

                    // 倒计时后加载用户信息
                    let countdown = 3;
                    const countdownElement = document.getElementById('countdown');
                    if (countdownElement) countdownElement.textContent = countdown;

                    const timer = setInterval(() => {
                        countdown--;
                        if (countdownElement) countdownElement.textContent = countdown;
                        if (countdown <= 0) {
                            clearInterval(timer);
                            if (loginSuccess) loginSuccess.style.display = 'none';
                            getUserInfo();
                            showUserContent();
                            const logoutBtn = document.getElementById('logoutBtn');
                            if (logoutBtn) logoutBtn.classList.remove('hidden');
                        }
                    }, 1000);
                } else {
                    showLoginError(result.message || '登录失败');
                }
            } catch (error) {
                console.error('登录失败:', error);
                showLoginError('登录过程中发生错误，请重试');
            }
        });
    }
}

// 初始化注册表单事件
function initRegisterFormEvents() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const registerBtn = this.querySelector('input[type="submit"]');
            const realName = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const phone = document.getElementById('registerPhone').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const address = document.getElementById('registerAddress').value.trim();
            const userTypeElement = document.querySelector('.user-type-option.active');
            const userType = userTypeElement ? userTypeElement.getAttribute('data-type') : 'elderly';
            const registerError = document.getElementById('registerError');

            // 前端简单验证
            if (realName === '' || email === '' || phone === '' || password === '' || confirmPassword === '') {
                registerError.textContent = '请填写所有必填字段';
                registerError.style.display = 'block';
                speakMessage('请填写所有必填字段');
                return;
            }

            if (password !== confirmPassword) {
                registerError.textContent = '两次输入的密码不一致';
                registerError.style.display = 'block';
                speakMessage('两次输入的密码不一致');
                return;
            }

            try {
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

                    const registerSuccess = document.getElementById('registerSuccess');
                    if (registerSuccess) registerSuccess.style.display = 'block';

                    speakMessage('注册成功，即将跳转到登录页面');

                    let countdown = 3;
                    const countdownElement = document.getElementById('registerCountdown');
                    if (countdownElement) countdownElement.textContent = countdown;

                    const timer = setInterval(() => {
                        countdown--;
                        if (countdownElement) countdownElement.textContent = countdown;
                        if (countdown <= 0) {
                            clearInterval(timer);
                            if (registerSuccess) registerSuccess.style.display = 'none';
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
                    speakMessage(result.message || '注册失败，请检查信息');
                }

            } catch (error) {
                console.error('注册请求失败：', error);
                registerError.textContent = '网络异常或服务器错误，请稍后再试';
                registerError.style.display = 'block';
                speakMessage('注册请求失败，请稍后再试');
            } finally {
                registerBtn.disabled = false;
                registerBtn.value = '注册';
            }
        });
    }
}

// 初始化忘记密码事件
function initForgotPasswordEvents() {
    let currentStep = 1;
    const totalSteps = 3;
    let countdownInterval;
    let countdown = 60;

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
            currentStep = step - 1;
        }
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
                speakMessage('请输入有效的邮箱地址');
            } else {
                document.getElementById('forgotEmail').parentElement.classList.remove('error');
            }
        }

        if (step === 2) {
            const code = document.getElementById('verificationCode').value;

            if (code.trim() === '' || code !== '123456') {
                document.getElementById('verificationCode').parentElement.parentElement.classList.add('error');
                isValid = false;
                speakMessage('请输入正确的验证码');
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
                speakMessage('密码至少8位，需包含字母和数字');
            } else {
                document.getElementById('newPassword').parentElement.classList.remove('error');
            }

            if (password !== confirmPassword) {
                document.getElementById('confirmNewPassword').parentElement.classList.add('error');
                isValid = false;
                speakMessage('两次输入的密码不一致');
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
            speakMessage('请输入有效的邮箱地址');
            return;
        } else {
            document.getElementById('forgotEmail').parentElement.classList.remove('error');
        }

        // 检查邮箱是否存在
        const users = userManager.getUsers();
        const userExists = users.some(u => u.email === email);

        if (!userExists) {
            document.getElementById('forgotEmail').parentElement.classList.add('error');
            speakMessage('该邮箱未注册');
            return;
        }

        sendCodeBtn.disabled = true;
        countdown = 60;

        document.getElementById('verificationCode').parentElement.parentElement.classList.add('success');

        console.log(`验证码已发送到: ${email}`);
        speakMessage('验证码已发送，请查收邮件（模拟验证码：123456）');

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

    // 忘记密码表单提交
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!validateStep(3)) {
                return;
            }

            // 获取表单数据
            const email = document.getElementById('forgotEmail').value;
            const newPassword = document.getElementById('newPassword').value;

            // 获取用户输入的手机号（在第3步中）
            const phoneInput = document.getElementById('forgotPhone');
            const phone = phoneInput ? phoneInput.value.trim() : '';

            // 使用本地用户管理器重置密码
            const result = userManager.resetPassword(email, phone, newPassword);

            if (result.success) {
                const forgotContainer = document.querySelector('.forgot-password-container');
                forgotContainer.classList.remove('active');

                const resetSuccess = document.getElementById('resetSuccess');
                if (resetSuccess) resetSuccess.style.display = 'block';

                speakMessage('密码重置成功，即将跳转到登录页面');

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
                        const loginFormContainer = document.querySelector('.login-form-container');
                        if (loginFormContainer) {
                            loginFormContainer.classList.add('active');
                            const loginEmail = document.getElementById('loginEmail');
                            if (loginEmail) loginEmail.focus();
                        }
                    }
                }, 1000);
            } else {
                // 重置失败，显示错误信息
                speakMessage(result.message || '密码重置失败');
                // 可以添加错误显示逻辑
            }
        });
    }

    // 重置忘记密码表单
    function resetForgotPasswordForm() {
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) forgotForm.reset();

        currentStep = 1;
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
}

// 初始化表单切换事件
function initFormToggleEvents() {
    // 登录表单关闭按钮
    const formClose = document.getElementById('form-close');
    const loginFormContainer = document.querySelector('.login-form-container');

    if (formClose && loginFormContainer) {
        formClose.addEventListener('click', () => {
            loginFormContainer.classList.remove('active');
        });
    }

    // 注册链接
    const showRegister = document.getElementById('show-register');
    const registerFormContainer = document.querySelector('.register-form-container');

    if (showRegister && registerFormContainer) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginFormContainer) loginFormContainer.classList.remove('active');
            registerFormContainer.classList.add('active');
        });
    }

    // 忘记密码链接
    const showForgotPassword = document.getElementById('show-forgot-password');
    const forgotPasswordContainer = document.querySelector('.forgot-password-container');

    if (showForgotPassword && forgotPasswordContainer) {
        showForgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginFormContainer) loginFormContainer.classList.remove('active');
            forgotPasswordContainer.classList.add('active');
        });
    }

    // 注册表单关闭按钮
    const registerFormClose = document.getElementById('register-form-close');
    if (registerFormClose && registerFormContainer) {
        registerFormClose.addEventListener('click', () => {
            registerFormContainer.classList.remove('active');
        });
    }

    // 登录链接（在注册表单中）
    const showLogin = document.getElementById('show-login');
    if (showLogin && loginFormContainer) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerFormContainer) registerFormContainer.classList.remove('active');
            loginFormContainer.classList.add('active');
        });
    }

    // 忘记密码表单关闭按钮
    const forgotFormClose = document.getElementById('forgot-form-close');
    if (forgotFormClose && forgotPasswordContainer) {
        forgotFormClose.addEventListener('click', function () {
            forgotPasswordContainer.classList.remove('active');
            speakMessage('已关闭找回密码');
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

    // 点击外部关闭表单
    if (loginFormContainer) {
        loginFormContainer.addEventListener('click', (e) => {
            if (e.target === loginFormContainer) {
                loginFormContainer.classList.remove('active');
            }
        });
    }

    if (registerFormContainer) {
        registerFormContainer.addEventListener('click', (e) => {
            if (e.target === registerFormContainer) {
                registerFormContainer.classList.remove('active');
            }
        });
    }

    if (forgotPasswordContainer) {
        forgotPasswordContainer.addEventListener('click', (e) => {
            if (e.target === forgotPasswordContainer) {
                forgotPasswordContainer.classList.remove('active');
            }
        });
    }
}

// 显示用户内容
function showUserContent() {
    const userContent = document.getElementById('userContent');
    const notLoggedIn = document.getElementById('notLoggedIn');
    if (userContent) userContent.classList.remove('hidden');
    if (notLoggedIn) notLoggedIn.classList.add('hidden');
}

// 显示登录提示
function showLoginPrompt() {
    const userContent = document.getElementById('userContent');
    const notLoggedIn = document.getElementById('notLoggedIn');
    if (userContent) userContent.classList.add('hidden');
    if (notLoggedIn) notLoggedIn.classList.remove('hidden');
}

// 显示登录错误信息
function showLoginError(message) {
    const loginError = document.getElementById('loginError');
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';

        // 语音提示错误
        speakMessage(message);

        setTimeout(() => {
            loginError.style.display = 'none';
        }, 3000);
    }
}

// 跳转到登录按钮事件
const goToLoginBtn = document.getElementById('goToLogin');
if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', function () {
        const loginFormContainer = document.querySelector('.login-form-container');
        if (loginFormContainer) loginFormContainer.classList.add('active');
    });
}

// 退出登录按钮事件
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        // 使用本地用户管理器登出
        userManager.logout();
        localStorage.removeItem('elderly_vue_token');
        localStorage.removeItem('userInfo');
        showLoginPrompt();
        logoutBtn.classList.add('hidden');
        speakMessage('已退出登录');
    });
}

// 获取用户信息
async function getUserInfo() {
    const token = localStorage.getItem('elderly_vue_token');
    if (!token) {
        showLoginPrompt();
        return;
    }

    try {
        // 使用本地用户管理器获取当前用户信息
        const currentUser = userManager.getCurrentUser();

        if (currentUser) {
            // 获取完整的用户数据
            const users = userManager.getUsers();
            const fullUserData = users.find(u => u.id === currentUser.id);

            if (fullUserData) {
                // 合并当前用户信息和完整数据
                const userData = {
                    ...fullUserData,
                    token: currentUser.token,
                    lastLoginAt: currentUser.loginTime
                };

                // 渲染用户信息
                renderUserInfoToPage(userData);

                // 如果是管理员，显示管理功能
                if (userData.userType === 'manager') {
                    showAdminFeatures();
                }
            } else {
                // 用户不存在，清除存储
                localStorage.removeItem('elderly_vue_token');
                localStorage.removeItem('userInfo');
                userManager.logout();
                showLoginPrompt();
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) logoutBtn.classList.add('hidden');
                speakMessage('用户信息不存在，请重新登录');
            }
        } else {
            // Token无效，清除存储
            localStorage.removeItem('elderly_vue_token');
            localStorage.removeItem('userInfo');
            showLoginPrompt();
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            speakMessage('登录已过期，请重新登录');
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        speakMessage('获取用户信息失败，请稍后重试');
        // 使用模拟数据作为后备
        loadCompleteTestData();
    }
}

// 渲染用户信息到页面
function renderUserInfoToPage(userData) {
    console.log('渲染用户信息:', userData);

    try {
        // 更新欢迎信息
        updateWelcomeInfo(userData);

        // 更新用户基本信息卡片
        updateUserBasicInfo(userData);

        // 更新统计数据
        updateUserStats(userData);

        // 更新服务记录
        updateServiceRecords(userData);

        // 更新偏好设置
        updateUserPreferences(userData);

        // 更新紧急联系人
        updateEmergencyContacts(userData);

        console.log('用户信息渲染完成');
        speakMessage('用户信息加载成功');

    } catch (error) {
        console.error('渲染用户信息时出错:', error);
        speakMessage('用户信息加载失败');
    }
}

// 更新欢迎信息
function updateWelcomeInfo(userData) {
    const welcomeTitle = document.querySelector('.user-welcome h2');
    const welcomeDate = document.querySelector('.user-welcome p');

    if (welcomeTitle && userData.realName) {
        welcomeTitle.textContent = `欢迎回来，${userData.realName}！`;
    }

    if (welcomeDate) {
        const now = new Date();
        const dateString = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        welcomeDate.textContent = `今天是${dateString}，祝您身体健康，心情愉快！`;
    }
}

// 更新用户基本信息
function updateUserBasicInfo(userData) {
    const elements = {
        name: document.querySelector('.user-details h3'),
        age: document.querySelector('.user-details p:nth-child(2)'),
        phone: document.querySelector('.user-details p:nth-child(3)'),
        address: document.querySelector('.user-details p:nth-child(4)'),
        healthStatus: document.querySelector('.user-health-status')
    };

    if (elements.name && userData.realName) {
        elements.name.textContent = userData.realName;
    }

    if (elements.age && userData.age) {
        elements.age.innerHTML = `<i class="fas fa-birthday-cake"></i> 年龄：${userData.age}岁`;
    }

    if (elements.phone && userData.phone) {
        // 保护隐私，只显示部分号码
        const maskedPhone = userData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        elements.phone.innerHTML = `<i class="fas fa-phone"></i> 电话：${maskedPhone}`;
    }

    if (elements.address && userData.address) {
        elements.address.innerHTML = `<i class="fas fa-map-marker-alt"></i> 地址：${userData.address}`;
    }

    if (elements.healthStatus && userData.healthStatus) {
        elements.healthStatus.textContent = userData.healthStatus;

        // 根据健康状态添加颜色
        elements.healthStatus.className = 'user-health-status';
        if (userData.healthStatus.includes('良好') || userData.healthStatus.includes('健康')) {
            elements.healthStatus.classList.add('status-good');
        } else if (userData.healthStatus.includes('注意') || userData.healthStatus.includes('一般')) {
            elements.healthStatus.classList.add('status-warning');
        } else {
            elements.healthStatus.classList.add('status-poor');
        }
    }
}

// 更新统计数据
function updateUserStats(userData) {
    if (!userData.stats) return;

    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length === 4) {
        // 本月服务次数
        statCards[0].querySelector('.stat-number').textContent =
            userData.stats.monthlyServiceCount || 12;

        // 待处理服务
        statCards[1].querySelector('.stat-number').textContent =
            userData.stats.pendingServiceCount || 5;

        // 服务满意度
        statCards[2].querySelector('.stat-number').textContent =
            (userData.stats.satisfactionRate || 98) + '%';

        // 累计服务天数
        statCards[3].querySelector('.stat-number').textContent =
            userData.stats.totalServiceDays || 36;
    }
}

// 更新服务记录
function updateServiceRecords(userData) {
    if (!userData.services) return;

    const serviceList = document.querySelector('.service-list');
    if (!serviceList) return;

    // 清空现有内容
    serviceList.innerHTML = '';

    if (userData.services.length === 0) {
        serviceList.innerHTML = '<div class="no-data">暂无服务记录</div>';
        return;
    }

    userData.services.forEach(service => {
        const serviceItem = createServiceItem(service);
        serviceList.appendChild(serviceItem);
    });
}

// 创建服务记录项
function createServiceItem(service) {
    const item = document.createElement('div');
    item.className = 'service-item';

    const iconClass = getServiceIcon(service.serviceType);
    const statusClass = getStatusClass(service.status);

    item.innerHTML = `
        <div class="service-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="service-details">
            <h4>${service.serviceType || '未知服务'}</h4>
            <p>${service.date || ''} ${service.description || ''}</p>
            <span class="service-status ${statusClass}">${getStatusText(service.status)}</span>
        </div>
    `;

    return item;
}

// 更新偏好设置
function updateUserPreferences(userData) {
    if (!userData.preferences) return;

    const preferenceList = document.querySelector('.preference-list');
    if (!preferenceList) return;

    preferenceList.innerHTML = '';

    if (userData.preferences.length === 0) {
        preferenceList.innerHTML = '<div class="no-data">暂无偏好设置</div>';
        return;
    }

    userData.preferences.forEach(pref => {
        const prefItem = document.createElement('div');
        prefItem.className = 'preference-item';

        prefItem.innerHTML = `
            <h4>${pref.type || '偏好设置'}</h4>
            <p>${pref.content || '暂无设置'}</p>
            <div class="preference-actions">
                <button class="edit-btn" onclick="editPreference('${pref.type}')">修改</button>
            </div>
        `;

        preferenceList.appendChild(prefItem);
    });
}

// 更新紧急联系人
function updateEmergencyContacts(userData) {
    if (!userData.emergencyContacts) return;

    const contactList = document.querySelector('.contact-list');
    if (!contactList) return;

    contactList.innerHTML = '';

    if (userData.emergencyContacts.length === 0) {
        contactList.innerHTML = '<div class="no-data">暂无紧急联系人</div>';
        return;
    }

    userData.emergencyContacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';

        const iconClass = getContactIcon(contact.relationship);

        contactItem.innerHTML = `
            <div class="contact-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="contact-details">
                <h4>${contact.name}${contact.relationship ? `（${contact.relationship}）` : ''}</h4>
                <p>${contact.phone || '暂无电话'}</p>
            </div>
        `;

        contactList.appendChild(contactItem);
    });
}

// 辅助函数 - 获取服务图标
function getServiceIcon(serviceType) {
    const iconMap = {
        '送餐服务': 'fas fa-utensils',
        '健康检查': 'fas fa-user-nurse',
        '居家清洁': 'fas fa-home',
        '代购服务': 'fas fa-shopping-cart',
        '陪同就医': 'fas fa-bus',
        '康复理疗': 'fas fa-hands-helping'
    };
    return iconMap[serviceType] || 'fas fa-concierge-bell';
}

// 辅助函数 - 获取状态样式
function getStatusClass(status) {
    const statusMap = {
        'completed': 'status-completed',
        'in-progress': 'status-in-progress',
        'pending': 'status-pending'
    };
    return statusMap[status] || 'status-pending';
}

// 辅助函数 - 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'completed': '已完成',
        'in-progress': '进行中',
        'pending': '待确认'
    };
    return statusMap[status] || '待确认';
}

// 辅助函数 - 获取联系人图标
function getContactIcon(relationship) {
    const iconMap = {
        '儿子': 'fas fa-male',
        '女儿': 'fas fa-female',
        '医生': 'fas fa-user-md',
        '医院': 'fas fa-hospital'
    };
    return iconMap[relationship] || 'fas fa-user';
}

// 编辑偏好设置
function editPreference(type) {
    alert(`修改 ${type} 设置功能开发中...`);
}

// 语音提示
function speakMessage(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}

// 加载模拟数据（作为后备）
function loadCompleteTestData() {
    console.log('加载模拟数据作为后备');

    const testData = {
        realName: "张建国",
        age: 72,
        phone: "13800138000",
        address: "北京市海淀区中关村街道3号楼2单元501",
        healthStatus: "良好",
        stats: {
            monthlyServiceCount: 12,
            pendingServiceCount: 5,
            satisfactionRate: 98,
            totalServiceDays: 36
        },
        services: [{
            serviceType: "送餐服务",
            date: "2023年11月14日",
            description: "午餐",
            status: "completed"
        },
        {
            serviceType: "健康检查",
            date: "2023年11月13日",
            description: "血压测量",
            status: "completed"
        },
        {
            serviceType: "居家清洁",
            date: "2023年11月12日",
            description: "全屋打扫",
            status: "completed"
        },
        {
            serviceType: "代购服务",
            date: "2023年11月15日",
            description: "生活用品采购",
            status: "in-progress"
        },
        {
            serviceType: "陪同就医",
            date: "2023年11月16日",
            description: "预约就诊",
            status: "pending"
        },
        {
            serviceType: "康复理疗",
            date: "2023年11月17日",
            description: "腿部康复训练",
            status: "pending"
        }
        ],
        preferences: [{
            type: "饮食偏好",
            content: "低盐、低糖、软食为主"
        },
        {
            type: "服务时间",
            content: "上午9:00-11:00，下午2:00-4:00"
        },
        {
            type: "健康关注",
            content: "高血压、关节炎管理"
        },
        {
            type: "兴趣爱好",
            content: "书法、听戏曲、散步"
        }
        ],
        emergencyContacts: [{
            name: "张明",
            relationship: "儿子",
            phone: "13800138001"
        },
        {
            name: "李红",
            relationship: "女儿",
            phone: "13900139002"
        },
        {
            name: "社区医生",
            relationship: "医生",
            phone: "010-12345678"
        },
        {
            name: "紧急救援",
            relationship: "医院",
            phone: "120"
        }
        ]
    };

    renderUserInfoToPage(testData);
}

// 适老化功能 - 字体调整
let fontSize = localStorage.getItem('fontSize') ? parseInt(localStorage.getItem('fontSize')) : 90;
document.documentElement.style.fontSize = `${fontSize}%`;

const fontSizeIncrease = document.getElementById('fontSizeIncrease');
const fontSizeDecrease = document.getElementById('fontSizeDecrease');

if (fontSizeIncrease) {
    fontSizeIncrease.addEventListener('click', () => {
        if (fontSize < 160) {
            fontSize += 10;
            document.documentElement.style.fontSize = `${fontSize}%`;
            localStorage.setItem('fontSize', fontSize);
            speakMessage('字体已增大');
        }
    });
}

if (fontSizeDecrease) {
    fontSizeDecrease.addEventListener('click', () => {
        if (fontSize > 70) {
            fontSize -= 10;
            document.documentElement.style.fontSize = `${fontSize}%`;
            localStorage.setItem('fontSize', fontSize);
            speakMessage('字体已缩小');
        }
    });
}

// 适老化功能 - 高对比度
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
        speakMessage(highContrastMode ? '已开启高对比度模式' : '已关闭高对比度模式');
    });
}

// 适老化功能 - 语音朗读
const readAloudBtn = document.getElementById('readAloud');
let isReading = false;

if (readAloudBtn) {
    readAloudBtn.addEventListener('click', () => {
        if (isReading) {
            window.speechSynthesis.cancel();
            isReading = false;
            readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
            return;
        }

        const userMainContent = document.querySelector('.user-main-content');
        if (userMainContent) {
            const visibleText = userMainContent.innerText.substring(0, 800);
            const utterance = new SpeechSynthesisUtterance(visibleText);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            utterance.pitch = 1.2;

            window.speechSynthesis.speak(utterance);
            isReading = true;
            readAloudBtn.innerHTML = '<i class="fas fa-volume-mute"></i> 停止朗读';

            utterance.onend = () => {
                isReading = false;
                readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
            };
        }
    });
}

// 登录表单显示/隐藏逻辑
const userBtn = document.getElementById('user-btn');
const formClose = document.getElementById('form-close');

if (userBtn) {
    userBtn.addEventListener('click', () => {
        const token = localStorage.getItem('elderly_vue_token');
        const loginFormContainer = document.querySelector('.login-form-container');

        if (token) {
            // 已登录，直接跳转到用户中心（如果不在用户中心页面）
            if (!window.location.href.includes('home.html')) {
                window.location.href = 'home.html'; // 确保跳转到 home.html
            }
        } else if (loginFormContainer) {
            // 未登录，显示登录表单
            loginFormContainer.classList.add('active');
        }
    });
}

// 显示管理员功能
function showAdminFeatures() {
    // 在用户信息卡片中添加管理功能入口
    const userInfoCard = document.querySelector('.user-info-card');
    if (userInfoCard) {
        // 检查是否已经添加过管理功能
        if (!document.getElementById('adminPanel')) {
            const adminPanel = document.createElement('div');
            adminPanel.id = 'adminPanel';
            adminPanel.innerHTML = `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <h4 style="color: #667eea; margin-bottom: 15px;">
                        <i class="fas fa-cogs"></i> 管理员功能
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <a href="user-management.html"
                           style="display: flex; align-items: center; gap: 10px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; transition: transform 0.3s ease;"
                           onmouseover="this.style.transform='translateY(-2px)'"
                           onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-users-cog"></i>
                            <span>用户管理</span>
                        </a>
                        <button onclick="exportUserData()"
                                style="display: flex; align-items: center; gap: 10px; padding: 12px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 8px; cursor: pointer; transition: transform 0.3s ease;"
                                onmouseover="this.style.transform='translateY(-2px)'"
                                onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-download"></i>
                            <span>导出数据</span>
                        </button>
                        <button onclick="showUserStats()"
                                style="display: flex; align-items: center; gap: 10px; padding: 12px; background: linear-gradient(135deg, #ffc107 0%, #ff6b6b 100%); color: white; border: none; border-radius: 8px; cursor: pointer; transition: transform 0.3s ease;"
                                onmouseover="this.style.transform='translateY(-2px)'"
                                onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-chart-bar"></i>
                            <span>查看统计</span>
                        </button>
                    </div>
                </div>
            `;
            userInfoCard.appendChild(adminPanel);
        }
    }
}

// 导出用户数据
function exportUserData() {
    const users = userManager.getUsers();
    const stats = userManager.getUserStats();

    // 创建CSV内容
    let csvContent = "ID,真实姓名,邮箱,手机号,用户类型,地址,注册时间,最后登录时间\n";

    users.forEach(user => {
        csvContent += `${user.id},${user.realName},${user.email},${user.phone},${user.userType},${user.address || ''},${user.createdAt},${user.lastLoginAt || '未登录'}\n`;
    });

    // 添加统计信息
    csvContent += `\n统计信息\n`;
    csvContent += `总用户数,${stats.total}\n`;
    csvContent += `老年人用户,${stats.byType.elderly}\n`;
    csvContent += `家属用户,${stats.byType.family}\n`;
    csvContent += `管理员用户,${stats.byType.manager}\n`;

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `用户数据_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    speakMessage('用户数据导出成功');
}

// 显示用户统计
function showUserStats() {
    const stats = userManager.getUserStats();
    const users = userManager.getUsers();

    // 创建统计信息弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    `;

    modalContent.innerHTML = `
        <span style="position: absolute; top: 15px; right: 20px; font-size: 1.5rem; cursor: pointer;" onclick="this.closest('div').parentElement.remove()">&times;</span>
        <h3 style="color: #667eea; margin-bottom: 20px;"><i class="fas fa-chart-bar"></i> 用户统计信息</h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="text-align: center; padding: 15px; background: #667eea; color: white; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: bold;">${stats.total}</div>
                <div>总用户数</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #28a745; color: white; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: bold;">${stats.byType.elderly}</div>
                <div>老年人用户</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #007bff; color: white; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: bold;">${stats.byType.family}</div>
                <div>家属用户</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #ffc107; color: white; border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: bold;">${stats.byType.manager}</div>
                <div>管理员用户</div>
            </div>
        </div>

        <h4 style="color: #333; margin-bottom: 15px;">最近注册用户</h4>
        <div style="max-height: 300px; overflow-y: auto;">
            ${users.slice(-5).reverse().map(user => `
                <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${user.realName}</strong> - ${user.email}
                        <br><small style="color: #666;">注册于 ${new Date(user.createdAt).toLocaleDateString()}</small>
                    </div>
                    <span style="background: ${getUserTypeColor(user.userType)}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 0.8rem;">
                        ${getUserTypeName(user.userType)}
                    </span>
                </div>
            `).join('')}
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 辅助函数：获取用户类型颜色
function getUserTypeColor(type) {
    switch(type) {
        case 'elderly': return '#28a745';
        case 'family': return '#007bff';
        case 'manager': return '#ffc107';
        default: return '#6c757d';
    }
}

// 辅助函数：获取用户类型名称
function getUserTypeName(type) {
    switch(type) {
        case 'elderly': return '老年人';
        case 'family': return '家属';
        case 'manager': return '管理员';
        default: return '未知';
    }
}