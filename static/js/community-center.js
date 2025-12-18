// 适老化功能 - 字体大小调整（修复功能）

// 调试信息：检查脚本加载
console.log('community-center.js 开始加载');
console.log('reservationManager 在脚本开始时:', typeof reservationManager);

// 备用方案：如果reservationManager未定义，创建一个简化版本
if (typeof reservationManager === 'undefined') {
    console.log('创建备用 reservationManager');

    window.reservationManager = {
        storageKey: 'silverAgeReservations',

        initializeStorage() {
            if (!localStorage.getItem(this.storageKey)) {
                localStorage.setItem(this.storageKey, JSON.stringify([]));
            }
        },

        getReservations() {
            const reservations = localStorage.getItem(this.storageKey);
            return reservations ? JSON.parse(reservations) : [];
        },

        saveReservations(reservations) {
            localStorage.setItem(this.storageKey, JSON.stringify(reservations));
        },

        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        validatePhone(phone) {
            const phoneRegex = /^1[3-9]\d{9}$/;
            return phoneRegex.test(phone);
        },

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
        },

        createReservation(reservationData) {
            const validation = this.validateReservationData(reservationData);
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message
                };
            }

            try {
                const newReservation = {
                    id: this.generateId(),
                    name: reservationData.name.trim(),
                    phone: reservationData.phone.trim(),
                    reservationDate: reservationData.reservationDate.trim(),
                    serviceType: reservationData.serviceType.trim(),
                    demandDescription: reservationData.demandDescription.trim(),
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

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
    };

    // 初始化
    reservationManager.initializeStorage();
    console.log('备用 reservationManager 创建完成:', typeof reservationManager);
}
// let fontSize = localStorage.getItem('fontSize') ? parseInt(localStorage.getItem('fontSize')) : 100;
// document.documentElement.style.fontSize = `${fontSize}%`; // 初始化字体大小

// const fontSizeIncrease = document.getElementById('fontSizeIncrease');
// const fontSizeDecrease = document.getElementById('fontSizeDecrease');

// // 增大字体（实际生效）
// fontSizeIncrease.addEventListener('click', () => {
// 	if (fontSize < 160) { // 最大限制160%
// 		fontSize += 10;
// 		document.documentElement.style.fontSize = `${fontSize}%`;
// 		localStorage.setItem('fontSize', fontSize); // 保存设置
// 		// 语音提示
// 		const utterance = new SpeechSynthesisUtterance('字体已增大');
// 		utterance.lang = 'zh-CN';
// 		window.speechSynthesis.speak(utterance);
// 	}
// });

// // 减小字体（实际生效）
// fontSizeDecrease.addEventListener('click', () => {
// 	if (fontSize > 70) { // 最小限制70%
// 		fontSize -= 10;
// 		document.documentElement.style.fontSize = `${fontSize}%`;
// 		localStorage.setItem('fontSize', fontSize); // 保存设置
// 		// 语音提示
// 		const utterance = new SpeechSynthesisUtterance('字体已缩小');
// 		utterance.lang = 'zh-CN';
// 		window.speechSynthesis.speak(utterance);
// 	}
// });

// 高对比度模式
// const highContrastBtn = document.getElementById('highContrast');
// let highContrastMode = localStorage.getItem('highContrast') === 'true';

// if (highContrastMode) {
// 	document.body.classList.add('high-contrast');
// }

// highContrastBtn.addEventListener('click', () => {
// 	highContrastMode = !highContrastMode;
// 	document.body.classList.toggle('high-contrast', highContrastMode);
// 	localStorage.setItem('highContrast', highContrastMode);
// 	// 语音提示
// 	const utterance = new SpeechSynthesisUtterance(highContrastMode ? '已开启高对比度模式' : '已关闭高对比度模式');
// 	utterance.lang = 'zh-CN';
// 	window.speechSynthesis.speak(utterance);
// });

// // 语音朗读功能
// const readAloudBtn = document.getElementById('readAloud');
// let isReading = false;
// let speechSynthesis = window.speechSynthesis;
// let utterance = null;

// readAloudBtn.addEventListener('click', () => {
// 	if (isReading) {
// 		speechSynthesis.cancel();
// 		isReading = false;
// 		readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
// 		return;
// 	}

// 	// 获取页面主要文本
// 	const mainText = document.querySelector('.service-text').innerText +
// 		document.querySelector('.section-title').nextElementSibling.innerText;
// 	utterance = new SpeechSynthesisUtterance(mainText.substring(0, 800));
// 	utterance.lang = 'zh-CN';
// 	utterance.rate = 0.8; // 语速稍慢
// 	utterance.pitch = 1.2; // 音调稍高

// 	speechSynthesis.speak(utterance);
// 	isReading = true;
// 	readAloudBtn.innerHTML = '<i class="fas fa-volume-mute"></i> 停止朗读';

// 	utterance.onend = () => {
// 		isReading = false;
// 		readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
// 	};
// });


//预约服务表单
document.addEventListener('DOMContentLoaded', function() {
	console.log('DOM加载完成');
	console.log('reservationManager 类型:', typeof reservationManager);
	console.log('LocalReservationManager 类型:', typeof LocalReservationManager);

	const serviceForm = document.getElementById('serviceForm');
	if (serviceForm) {
	serviceForm.addEventListener('submit', async function (event) {
		event.preventDefault();
		//1.获取表单数据
		const formData = {
			name: document.querySelector('input[name="name"]').value.trim(),
			reservationDate: document.querySelector('input[name="date"]').value.trim(),
			phone: document.querySelector('input[name="phone"]').value.trim(),
			serviceType: document.querySelector('select[name="serviceType"]').value.trim(),
			demandDescription: document.querySelector('textarea[name="需求描述"]').value.trim()
		}

		try {
			// 添加调试信息
			console.log('提交的表单数据:', formData);
			console.log('reservationManager 是否存在:', typeof reservationManager);

			// 现在应该总是可用的，因为有备用方案
			console.log('最终 reservationManager 类型:', typeof reservationManager);

			// 2. 使用本地预约管理器创建预约
			const result = reservationManager.createReservation(formData);

			// 添加调试信息
			console.log('预约创建结果:', result);

			// 根据结果处理响应
			if (result.success) {
				// 成功：显示成功信息
				const successText = result.message || '预约提交成功，我们会尽快与您联系！';
				console.log('显示成功消息:', successText);
				showMessage('formSuccess', successText);
				this.reset(); // 重置表单
			} else {
				// 业务错误：显示错误信息
				console.log('显示错误消息:', result.message);
				showMessage('formError', result.message || '预约提交失败');
			}
		} catch (error) {
			// 捕获其他错误
			console.error('预约提交失败:', error);
			console.error('错误堆栈:', error.stack);
			showMessage('formError', '预约提交过程中发生错误，请重试');
		}

	});
	}
});

// 统一消息处理（含语音提示）
function showMessage(elementId, text) {
	// 隐藏所有消息
	document.querySelectorAll('.message').forEach(el => el.style.display = 'none');
	// 显示当前消息
	const messageEl = document.getElementById(elementId);
	if (messageEl) {
		messageEl.style.display = 'block';
		messageEl.textContent = text;
		// 语音提示
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = 'zh-CN';
		speechSynthesis.speak(utterance);
		// 3秒后自动隐藏
		setTimeout(() => {
			if (messageEl) messageEl.style.display = 'none';
		}, 3000);
	} else {
		console.error('消息元素不存在:', elementId);
		// 作为备用，使用alert显示消息
		alert(text);
	}
}

// 导航菜单切换
// const menuBar = document.getElementById('menu-bar');
// const navbar = document.querySelector('.navbar');

// menuBar.addEventListener('click', () => {
// 	navbar.classList.toggle('active');
// });

// // 登录表单切换
// const loginBtn = document.getElementById('login-btn');
// const formClose = document.getElementById('form-close');
// const loginForm = document.querySelector('.login-form-container');

// loginBtn.addEventListener('click', () => {
// 	loginForm.classList.add('active');
// });

// formClose.addEventListener('click', () => {
// 	loginForm.classList.remove('active');
// });

// // 搜索框切换
// const searchBtn = document.getElementById('search-btn');
// const searchBar = document.querySelector('.search-bar-container');

// searchBtn.addEventListener('click', () => {
// 	searchBar.classList.toggle('active');
// });

// // 平滑滚动
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
// 	anchor.addEventListener('click', function (e) {
// 		e.preventDefault();

// 		const targetId = this.getAttribute('href');
// 		const targetElement = document.querySelector(targetId);

// 		if (targetElement) {
// 			window.scrollTo({
// 				top: targetElement.offsetTop - 80,
// 				behavior: 'smooth'
// 			});

// 			navbar.classList.remove('active');
// 		}
// 	});
// });