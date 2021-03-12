class MyVue extends EventTarget { // 继承自定义事件   888888888
	// 拿到实例化对象传的配置 111111111111111
	constructor(options) {
		super(); // 继承必须有
		this.$options = options;
		this.compile();
		this.observe(this.$options.data);
	}
	// 观察数据         6666666666666
	observe(data) {
		let keys = Object.keys(data);
		keys.forEach(key => {
			this.defineReact(data, key, data[key]); // 对象，对象的属性，值
		})
	}
	// OBJ.defineProperty 数据劫持   777777777777
	defineReact(data, key, value) {
		let _this = this;
		Object.defineProperty(data, key, { // 对象，对象的属性，定义set get
			configurable: true, // 不然delete 删不了
			enumerable: true, // 默认false，不能枚举
			get() {
				console.log('get...');
				return value;
			},
			set(newValue) {
				console.log('set...', newValue);
				// let event = new Event(key);  // 888888888888
				let event = new CustomEvent(key, {
					detail: newValue
				});
				_this.dispatchEvent(event); // 触发
				value = newValue;
			}
		})
	}
	compile() {
		// 222222222222
		let el = document.querySelector(this.$options.el);
		this.compileNode(el);
	}

	// 方便递归查找文本节点的节点 333333333333
	compileNode(el) {
		let childNodes = el.childNodes;
		childNodes.forEach(node => {
			if (node.nodeType === 1) {
				// 标签           10000000000000 匹配指令
				let attrs = node.attributes;
				// 遍历每个属性 拿到属性名和值 按v-匹配，按匹配修改
				Array.from(attrs).forEach(attr => {
					let attrName = attr.name;
					let attrValue = attr.value;
					if (attrName.indexOf('v-' === 0)) {
						attrName = attrName.substr(2);
						if (attrName === 'html') {
							node.innerHTML = this.$options.data[attrValue];
						} else if (attrName === 'model') {
							// input双向绑定
							node.value = this.$options.data[attrValue];
							// 监听改变
							node.addEventListener("input", e => {
								console.log(e.target.value); // 把值传回optin.data
								this.$options.data[attrValue] = e.target.value;
							})
						}
					}
				})

				if (node.childNodes.length > 0) {
					// 如果有子节点就递归 5555555555555555
					this.compileNode(node);
				}
			} else if (node.nodeType === 3) { // 文本内容 4444444444444
				let reg = /\{\{\s*(\S+)\s*\}\}/g; // 匹配双大括号，()为分组
				let textContent = node.textContent;
				if (reg.test(textContent)) {
					let $1 = RegExp.$1;
					node.textContent = node.textContent.replace(reg, this.$options.data[$1]);
					// 绑定事件
					this.addEventListener($1, e => { // $1跟上面的key一样。 999999999999999
						// console.log("触发了修改..");
						// 重新渲染视图；
						console.log(e.detail);
						// 二次渲染
						let oldValue = this.$options.data[$1];
						let reg = new RegExp(oldValue); // 匹配老值
						node.textContent = node.textContent.replace(reg, e.detail)
					})
				}
			}
		})
	}
}
