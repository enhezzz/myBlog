function Vue(option) {
    this.$el = option.el;
    this.$data = option.data;
    observe(this.$data);
    render(this.$el, this.$data);
    (function _proxy() {                        //将对vue对象getter/setter设置成对$data的getter/setter操作
        let keys = Object.keys(this.$data);
        keys.forEach(key => {
            Object.defineProperty(this, key, {
                configurable: true,
                set: (value) => {
                    this.$data[key] = value;
                },
                get: function () {
                    return this.$data[key];
                }
            })
        })
    }).call(this)
}

function observe(originObj) {
    for (var key in originObj) {
        if (typeof originObj[key] == "object")
            observe(originObj[key]);
        defineReactive(originObj, key, originObj[key]); //对选项中data的每个属性设置成getter/setter函数
    }
}

function render(el, data) {
    let root = document.querySelector(el);
    let childNodes = root.childNodes;
    Array.prototype.slice.call(childNodes).forEach((child, index, childs) => {
        compile(child, data);
    })
}

function defineReactive(originObj, key, value) {
    let dep = new Dep();
    Object.defineProperty(originObj, key, {
        configurable: true,
        set: function (newValue) {
            if (newValue !== value) {
                value = newValue;
            }
            dep.notify()                        //发布者发出通知
        },
        get: function () {
            if (Dep.target) {
                dep.addWatcher(Dep.target)     //当发布者的target存在时，订阅者订阅发布者
            }
            return value;
        }
    })

}

function compile(node, data) {
    if (node.nodeType == 1) {
        let attributes = node.attributes;
        Array.prototype.slice.call(attributes).forEach((attribute, index) => {
            let nodeName = attribute.nodeName;
            if (nodeName == "v-model") {
                let nodeValue = attribute.nodeValue;
                node.addEventListener('input', function (e) {
                    data[nodeValue] = e.target.value;           //监听input，更改data属性值
                })
                new Watcher(node, nodeValue, data);            //为input设置一个订阅者
            }
        })
    } else if (node.nodeType == 3) {
        let regExp = /\{\{(.*)\}\}/;
        let text = node.nodeValue;
        if (regExp.test(text))
            new Watcher(node, RegExp.$1, data);                 //为文本节点设置一个订阅者
    }
}

function Watcher(node, key, data) {
    this.node = node;
    this.key = key;
    this.data = data;

    Dep.target = this;              //将发布者的target设置为临时的当前对象
    this.update()                   //首次渲染，当前订阅者订阅发布者
    Dep.target = null;              //取消发布者的target对象

}

Watcher.prototype.update = function () {
    if (this.node.nodeType == 1) {
        this.node.value = this.data[this.key];   //为元素节点时的更新
    } else
        this.node.nodeValue = this.data[this.key];//为文本节点时的更新
}

function Dep() {
    this.watchers = [];
}

Dep.prototype.addWatcher = function (watcher) {
    this.watchers.push(watcher);
}
Dep.prototype.notify = function () {
    this.watchers.forEach(watcher => {
        watcher.update();
    })
}