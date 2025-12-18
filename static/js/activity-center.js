// 适老化功能 - 字体大小调整（修复功能）
let fontSize = localStorage.getItem('fontSize') ? parseInt(localStorage.getItem('fontSize')) : 100;
document.documentElement.style.fontSize = `${fontSize}%`; // 初始化字体大小

const fontSizeIncrease = document.getElementById('fontSizeIncrease');
const fontSizeDecrease = document.getElementById('fontSizeDecrease');

// 增大字体（实际生效）
fontSizeIncrease.addEventListener('click', () => {
	if (fontSize < 160) { // 最大限制160%
		fontSize += 10;
		document.documentElement.style.fontSize = `${fontSize}%`;
		localStorage.setItem('fontSize', fontSize); // 保存设置
		// 语音提示
		const utterance = new SpeechSynthesisUtterance('字体已增大');
		utterance.lang = 'zh-CN';
		window.speechSynthesis.speak(utterance);
	}
});

// 减小字体（实际生效）
fontSizeDecrease.addEventListener('click', () => {
	if (fontSize > 70) { // 最小限制70%
		fontSize -= 10;
		document.documentElement.style.fontSize = `${fontSize}%`;
		localStorage.setItem('fontSize', fontSize); // 保存设置
		// 语音提示
		const utterance = new SpeechSynthesisUtterance('字体已缩小');
		utterance.lang = 'zh-CN';
		window.speechSynthesis.speak(utterance);
	}
});

// 高对比度模式
const highContrastBtn = document.getElementById('highContrast');
let highContrastMode = localStorage.getItem('highContrast') === 'true';

if (highContrastMode) {
	document.body.classList.add('high-contrast');
}

highContrastBtn.addEventListener('click', () => {
	highContrastMode = !highContrastMode;
	document.body.classList.toggle('high-contrast', highContrastMode);
	localStorage.setItem('highContrast', highContrastMode);
	// 语音提示
	const utterance = new SpeechSynthesisUtterance(highContrastMode ? '已开启高对比度模式' : '已关闭高对比度模式');
	utterance.lang = 'zh-CN';
	window.speechSynthesis.speak(utterance);
});

// 语音朗读功能
const readAloudBtn = document.getElementById('readAloud');
let isReading = false;
let speechSynthesis = window.speechSynthesis;
let utterance = null;

readAloudBtn.addEventListener('click', () => {
	if (isReading) {
		speechSynthesis.cancel();
		isReading = false;
		readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
		return;
	}

	// 获取页面主要文本
	const mainText = document.querySelector('.intro-text').innerText +
		document.querySelector('.calendar-title').textContent +
		document.querySelector('.calendar-month').textContent;
	utterance = new SpeechSynthesisUtterance(mainText.substring(0, 800));
	utterance.lang = 'zh-CN';
	utterance.rate = 0.8; // 语速稍慢
	utterance.pitch = 1.2; // 音调稍高

	speechSynthesis.speak(utterance);
	isReading = true;
	readAloudBtn.innerHTML = '<i class="fas fa-volume-mute"></i> 停止朗读';

	utterance.onend = () => {
		isReading = false;
		readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> 语音朗读';
	};
});

// 活动报名表单处理
document.getElementById('activityForm').addEventListener('submit', function(event) {
	event.preventDefault();

	const name = this.querySelector('input[name="name"]').value;
	const phone = this.querySelector('input[name="phone"]').value;
	const activity = this.querySelector('select[name="activity"]').value;

	if (!name || !phone || !activity) {
		document.getElementById('regError').style.display = 'block';
		document.getElementById('regSuccess').style.display = 'none';

		// 语音提示
		const utterance = new SpeechSynthesisUtterance('请填写完整报名信息');
		utterance.lang = 'zh-CN';
		speechSynthesis.speak(utterance);

		setTimeout(() => {
			document.getElementById('regError').style.display = 'none';
		}, 3000);
	} else {
		document.getElementById('regSuccess').style.display = 'block';
		document.getElementById('regError').style.display = 'none';

		// 语音提示
		const utterance = new SpeechSynthesisUtterance('报名成功，我们将短信通知您活动详情');
		utterance.lang = 'zh-CN';
		speechSynthesis.speak(utterance);

		this.reset();

		setTimeout(() => {
			document.getElementById('regSuccess').style.display = 'none';
		}, 5000);
	}
});

// 导航菜单切换
const menuBar = document.getElementById('menu-bar');
const navbar = document.querySelector('.navbar');

menuBar.addEventListener('click', () => {
	navbar.classList.toggle('active');
});

// 登录表单切换
const loginBtn = document.getElementById('login-btn');
const formClose = document.getElementById('form-close');
const loginForm = document.querySelector('.login-form-container');

loginBtn.addEventListener('click', () => {
	loginForm.classList.add('active');
});

formClose.addEventListener('click', () => {
	loginForm.classList.remove('active');
});

// 搜索框切换
const searchBtn = document.getElementById('search-btn');
const searchBar = document.querySelector('.search-bar-container');

searchBtn.addEventListener('click', () => {
	searchBar.classList.toggle('active');
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function(e) {
		e.preventDefault();

		const targetId = this.getAttribute('href');
		const targetElement = document.querySelector(targetId);

		if (targetElement) {
			window.scrollTo({
				top: targetElement.offsetTop - 80,
				behavior: 'smooth'
			});

			navbar.classList.remove('active');
		}
	});
});

// 为活动卡片添加点击放大查看功能
document.querySelectorAll('.activity-card').forEach(card => {
	card.addEventListener('click', function(e) {
		// 如果点击的是报名按钮则不触发卡片放大
		if (e.target.closest('.btn-register')) return;

		this.classList.toggle('expanded');
		if (this.classList.contains('expanded')) {
			this.style.transform = 'scale(1.03)';
			this.style.zIndex = '10';
			this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
		} else {
			this.style.transform = '';
			this.style.zIndex = '';
			this.style.boxShadow = '';
		}
	});
});