/**
 * 本地预约管理系统
 * 使用 localStorage 存储预约数据，提供预约创建、查询等功能
 */
class LocalReservationManager {
    constructor() {
        this.storageKey = 'silverAgeReservations';
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
     * 获取所有预约
     */
    getReservations() {
        const reservations = localStorage.getItem(this.storageKey);
        return reservations ? JSON.parse(reservations) : [];
    }

    /**
     * 保存预约数据
     */
    saveReservations(reservations) {
        localStorage.setItem(this.storageKey, JSON.stringify(reservations));
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 验证手机号格式
     */
    validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    /**
     * 验证表单数据
     */
    validateReservationData(data) {
        if (!data.name || data.name.trim() === '') {
            return { valid: false, message: '请填写姓名' };
        }

        if (!data.phone || data.phone.trim() === '') {
            return { valid: false, message: '请填写手机号' };
        }

        if (!this.validatePhone(data.phone)) {
            return { valid: false, message: '手机号格式不正确' };
        }

        if (!data.reservationDate || data.reservationDate.trim() === '') {
            return { valid: false, message: '请选择预约日期' };
        }

        if (!data.serviceType || data.serviceType.trim() === '') {
            return { valid: false, message: '请选择服务类型' };
        }

        if (!data.demandDescription || data.demandDescription.trim() === '') {
            return { valid: false, message: '请填写需求描述' };
        }

        return { valid: true, message: '验证通过' };
    }

    /**
     * 创建预约
     */
    createReservation(reservationData) {
        const validation = this.validateReservationData(reservationData);

        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
            };
        }

        try {
            // 创建新预约
            const newReservation = {
                id: this.generateId(),
                name: reservationData.name.trim(),
                phone: reservationData.phone.trim(),
                reservationDate: reservationData.reservationDate.trim(),
                serviceType: reservationData.serviceType.trim(),
                demandDescription: reservationData.demandDescription.trim(),
                status: 'pending', // pending, confirmed, completed, cancelled
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 保存预约
            const reservations = this.getReservations();
            reservations.push(newReservation);
            this.saveReservations(reservations);

            return {
                success: true,
                message: '预约创建成功',
                data: {
                    reservationId: newReservation.id,
                    reservation: newReservation
                }
            };

        } catch (error) {
            console.error('创建预约失败:', error);
            return {
                success: false,
                message: '预约创建失败，请重试'
            };
        }
    }

    /**
     * 获取预约统计信息
     */
    getReservationStats() {
        const reservations = this.getReservations();
        const stats = {
            total: reservations.length,
            pending: reservations.filter(r => r.status === 'pending').length,
            confirmed: reservations.filter(r => r.status === 'confirmed').length,
            completed: reservations.filter(r => r.status === 'completed').length,
            cancelled: reservations.filter(r => r.status === 'cancelled').length,
            byServiceType: {}
        };

        // 按服务类型统计
        reservations.forEach(reservation => {
            if (!stats.byServiceType[reservation.serviceType]) {
                stats.byServiceType[reservation.serviceType] = 0;
            }
            stats.byServiceType[reservation.serviceType]++;
        });

        return stats;
    }

    /**
     * 更新预约状态
     */
    updateReservationStatus(reservationId, status) {
        const reservations = this.getReservations();
        const reservationIndex = reservations.findIndex(r => r.id === reservationId);

        if (reservationIndex === -1) {
            return {
                success: false,
                message: '预约不存在'
            };
        }

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return {
                success: false,
                message: '无效的预约状态'
            };
        }

        reservations[reservationIndex].status = status;
        reservations[reservationIndex].updatedAt = new Date().toISOString();

        this.saveReservations(reservations);

        return {
            success: true,
            message: '预约状态更新成功',
            data: {
                reservation: reservations[reservationIndex]
            }
        };
    }

    /**
     * 删除预约
     */
    deleteReservation(reservationId) {
        const reservations = this.getReservations();
        const filteredReservations = reservations.filter(r => r.id !== reservationId);

        if (filteredReservations.length === reservations.length) {
            return {
                success: false,
                message: '预约不存在'
            };
        }

        this.saveReservations(filteredReservations);

        return {
            success: true,
            message: '预约删除成功'
        };
    }

    /**
     * 获取用户预约列表
     */
    getUserReservations(userName, userPhone) {
        const reservations = this.getReservations();
        return reservations.filter(r =>
            r.name === userName && r.phone === userPhone
        );
    }

    /**
     * 获取今天的预约
     */
    getTodayReservations() {
        const reservations = this.getReservations();
        const today = new Date().toISOString().split('T')[0];

        return reservations.filter(r =>
            r.reservationDate === today
        );
    }

    /**
     * 获取未来预约
     */
    getUpcomingReservations() {
        const reservations = this.getReservations();
        const today = new Date().toISOString().split('T')[0];

        return reservations.filter(r =>
            r.reservationDate >= today && r.status !== 'cancelled'
        ).sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate));
    }

    /**
     * 导出预约数据
     */
    exportReservations() {
        const reservations = this.getReservations();
        const stats = this.getReservationStats();

        // 创建CSV内容
        let csvContent = "ID,姓名,手机号,预约日期,服务类型,需求描述,状态,创建时间\n";

        reservations.forEach(reservation => {
            csvContent += `${reservation.id},${reservation.name},${reservation.phone},${reservation.reservationDate},${reservation.serviceType},"${reservation.demandDescription}",${reservation.status},${reservation.createdAt}\n`;
        });

        // 添加统计信息
        csvContent += `\n统计信息\n`;
        csvContent += `总预约数,${stats.total}\n`;
        csvContent += `待确认,${stats.pending}\n`;
        csvContent += `已确认,${stats.confirmed}\n`;
        csvContent .= `已完成,${stats.completed}\n`;
        csvContent += `已取消,${stats.cancelled}\n`;

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `预约数据_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return {
            success: true,
            message: '预约数据导出成功'
        };
    }

    /**
     * 清空所有预约数据
     */
    clearAllReservations() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
        return {
            success: true,
            message: '所有预约数据已清空'
        };
    }
}

// 创建全局实例
const reservationManager = new LocalReservationManager();
console.log('LocalReservationManager 已加载');
console.log('reservationManager 实例已创建:', typeof reservationManager);