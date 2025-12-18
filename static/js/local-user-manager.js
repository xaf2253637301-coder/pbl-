/**
 * 本地用户管理系统
 * 使用 localStorage 存储用户数据，提供注册、登录、用户管理等功能
 */
class LocalUserManager {
    constructor() {
        this.storageKey = 'silverAgeUsers';
        this.currentUserKey = 'silverAgeCurrentUser';
        this.initializeStorage();
    }

    /**
     * 初始化存储
     */
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    /**
     * 获取所有用户
     */
    getUsers() {
        const users = localStorage.getItem(this.storageKey);
        return users ? JSON.parse(users) : [];
    }

    /**
     * 保存用户数据
     */
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 密码加密（简单hash）
     */
    hashPassword(password) {
        // 简单的密码哈希，实际项目中应使用更安全的方法
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString();
    }

    /**
     * 验证邮箱格式
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 验证手机号格式
     */
    validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    /**
     * 验证密码强度
     */
    validatePassword(password) {
        return password.length >= 6;
    }

    /**
     * 检查邮箱是否已存在
     */
    isEmailExists(email) {
        const users = this.getUsers();
        return users.some(user => user.email === email);
    }

    /**
     * 检查手机号是否已存在
     */
    isPhoneExists(phone) {
        const users = this.getUsers();
        return users.some(user => user.phone === phone);
    }

    /**
     * 用户注册
     */
    register(userData) {
        const { realName, email, phone, password, address, userType } = userData;

        // 验证必填字段
        if (!realName || !email || !phone || !password || !userType) {
            return {
                success: false,
                message: '请填写所有必填字段'
            };
        }

        // 验证邮箱格式
        if (!this.validateEmail(email)) {
            return {
                success: false,
                message: '邮箱格式不正确'
            };
        }

        // 验证手机号格式
        if (!this.validatePhone(phone)) {
            return {
                success: false,
                message: '手机号格式不正确'
            };
        }

        // 验证密码强度
        if (!this.validatePassword(password)) {
            return {
                success: false,
                message: '密码长度至少6位'
            };
        }

        // 检查邮箱是否已存在
        if (this.isEmailExists(email)) {
            return {
                success: false,
                message: '该邮箱已被注册'
            };
        }

        // 检查手机号是否已存在
        if (this.isPhoneExists(phone)) {
            return {
                success: false,
                message: '该手机号已被注册'
            };
        }

        // 创建新用户
        const newUser = {
            id: this.generateId(),
            realName,
            email,
            phone,
            password: this.hashPassword(password),
            address: address || '',
            userType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        };

        // 保存用户
        const users = this.getUsers();
        users.push(newUser);
        this.saveUsers(users);

        return {
            success: true,
            message: '注册成功',
            data: {
                user: {
                    id: newUser.id,
                    realName: newUser.realName,
                    email: newUser.email,
                    phone: newUser.phone,
                    address: newUser.address,
                    userType: newUser.userType,
                    createdAt: newUser.createdAt
                }
            }
        };
    }

    /**
     * 用户登录
     */
    login(email, password) {
        // 验证输入
        if (!email || !password) {
            return {
                success: false,
                message: '请填写邮箱和密码'
            };
        }

        // 查找用户
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.isActive);

        if (!user) {
            return {
                success: false,
                message: '用户不存在或已被禁用'
            };
        }

        // 验证密码
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return {
                success: false,
                message: '密码错误'
            };
        }

        // 生成token（简单实现）
        const token = btoa(`${user.id}:${Date.now()}`);

        // 更新最后登录时间
        user.lastLoginAt = new Date().toISOString();
        this.saveUsers(users);

        // 保存当前用户信息
        const currentUser = {
            id: user.id,
            realName: user.realName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            userType: user.userType,
            token,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));

        return {
            success: true,
            message: '登录成功',
            data: {
                token,
                user: {
                    id: user.id,
                    realName: user.realName,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    userType: user.userType
                }
            }
        };
    }

    /**
     * 获取当前登录用户
     */
    getCurrentUser() {
        const currentUserData = localStorage.getItem(this.currentUserKey);
        return currentUserData ? JSON.parse(currentUserData) : null;
    }

    /**
     * 检查用户是否已登录
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    /**
     * 用户登出
     */
    logout() {
        localStorage.removeItem(this.currentUserKey);
        return {
            success: true,
            message: '已退出登录'
        };
    }

    /**
     * 更新用户信息
     */
    updateUser(userId, updateData) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return {
                success: false,
                message: '用户不存在'
            };
        }

        // 更新允许修改的字段
        const allowedFields = ['realName', 'phone', 'address', 'userType'];
        const updates = {};

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        });

        // 如果更新邮箱，检查是否重复
        if (updateData.email && updateData.email !== users[userIndex].email) {
            if (this.isEmailExists(updateData.email)) {
                return {
                    success: false,
                    message: '该邮箱已被使用'
                };
            }
            updates.email = updateData.email;
        }

        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveUsers(users);

        // 如果更新的是当前用户，同时更新当前用户信息
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const updatedCurrentUser = {
                ...currentUser,
                ...updates
            };
            localStorage.setItem(this.currentUserKey, JSON.stringify(updatedCurrentUser));
        }

        return {
            success: true,
            message: '用户信息更新成功',
            data: {
                user: {
                    id: users[userIndex].id,
                    realName: users[userIndex].realName,
                    email: users[userIndex].email,
                    phone: users[userIndex].phone,
                    address: users[userIndex].address,
                    userType: users[userIndex].userType
                }
            }
        };
    }

    /**
     * 修改密码
     */
    changePassword(userId, oldPassword, newPassword) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return {
                success: false,
                message: '用户不存在'
            };
        }

        const user = users[userIndex];

        // 验证旧密码
        if (user.password !== this.hashPassword(oldPassword)) {
            return {
                success: false,
                message: '原密码错误'
            };
        }

        // 验证新密码强度
        if (!this.validatePassword(newPassword)) {
            return {
                success: false,
                message: '新密码长度至少6位'
            };
        }

        // 更新密码
        user.password = this.hashPassword(newPassword);
        user.updatedAt = new Date().toISOString();

        this.saveUsers(users);

        return {
            success: true,
            message: '密码修改成功'
        };
    }

    /**
     * 获取用户统计信息
     */
    getUserStats() {
        const users = this.getUsers();
        const stats = {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            byType: {
                elderly: users.filter(u => u.userType === 'elderly').length,
                family: users.filter(u => u.userType === 'family').length,
                manager: users.filter(u => u.userType === 'manager').length
            }
        };

        return stats;
    }

    /**
     * 重置密码（忘记密码功能）
     */
    resetPassword(email, phone, newPassword) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.phone === phone && u.isActive);

        if (!user) {
            return {
                success: false,
                message: '用户不存在或邮箱手机号不匹配'
            };
        }

        // 验证新密码强度
        if (!this.validatePassword(newPassword)) {
            return {
                success: false,
                message: '新密码长度至少6位'
            };
        }

        // 更新密码
        user.password = this.hashPassword(newPassword);
        user.updatedAt = new Date().toISOString();

        this.saveUsers(users);

        return {
            success: true,
            message: '密码重置成功，请使用新密码登录'
        };
    }
}

// 创建全局实例
const userManager = new LocalUserManager();