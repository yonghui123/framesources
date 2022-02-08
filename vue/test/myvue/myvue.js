
function defineReactive(obj, key, val){
  observe(val)
  // 一个key值对应一个dep
  const dep = new Dep()
  // 属性拦截
  Object.defineProperty(obj, key, { 
    get(){
      console.log('get', key)
      // 依赖收集关系的建立
      Dep.target && dep.addDep(Dep.target)
      return val
    },

    set(newVal) {
      if(newVal !== val) {
        console.log('set',key)
        val = newVal
        // 通知更新
        dep.notify()
      }
    },
  })
}


function observe(obj) {
  if(typeof obj !== 'object' ||  obj === null) {
    return
  }
  Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]))
}



function proxy(vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(newVal) {
        vm.$data[key] = newVal
      }
    })
  })
}
this.foo = ''
class Vue {
  constructor(options) {
    // 保存选项
    this.$options = options
    console.log(options.data)
    this.$data = options.data
    // 添加响应式
    observe(this.$data)
    proxy(this)
    // 添加编译
    new Compile(options.el, this)
  }
  set(obj, key, val) {
    defineReactive(obj, key, val)
  }
}
// 遍历模板，解析动态部分，初始化并获得更新函数

class Compile{
  constructor(el, vm) {
    // 获取宿主元素和dom节点
    const dom = document.querySelector(el)
    this.$vm = vm
    this.compile(dom)
  }

  compile(el) {
    const childNodes = el.childNodes
    childNodes.forEach(node => {
      if(this.isElement(node)) {
        // 是元素
        console.log('element', node.nodeName)
        const attrs = node.attributes
        Array.from(attrs).forEach((attr) => {
          // 判断是否是一个动态属性
          const attrName = attr.name
          const exp = attr.value
          if(this.isDir(attrName)) {
            const dir = attrName.substring(2)
            // 查看是否是合法的指令，如果是则执行相应的函数
            console.log(this[dir])
            this[dir] && this[dir](node, exp)
          } 
        })
        // 递归
        if(node.childNodes.length > 0) {
          this.compile(node)
        }
      } else if(this.isInter(node)) {
        console.log('text', node.textContent)
        this.compileText(node)
      }
    })
  }
  // 处理所有的动态绑定
  update(node, exp, dir) {
    // 初始化
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])
    // 更新, 第一次初始化的时候，会调用watcher
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }
  // k-text
  text(node, exp) {
    this.update(node, exp, 'text')
  }
  textUpdater(node, val) {
    node.textContent = val
  }
  // k-html
  html(node, exp) {

  }
  isElement(node) {
    return node.nodeType == 1
  }
  isInter(node) {
    return node.nodeType == 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
  compileText(node) {
    // 获取表达式的值
    this.update(node, RegExp.$1, 'text')
    // console.log(node)
    // console.log(this.$vm)
    // node.textContent = this.$vm[RegExp.$1]
  }
  isDir(attrName) {
    return attrName.startsWith('k-')
  }

}
// dep和响应式的属性之间有一一对应关系
// 并负责通知watcher更新
class Dep {
  constructor() {
    this.deps = []
  }

  addDep(dep) {
    this.deps.push(dep)
  }

  notify() {
    this.deps.forEach(dep => dep.update())
  }
}

class Watcher{
  constructor(vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updater = updater
    //watcher 初始化的时候，手动读取key值，触发依赖收集，并将自己添加到dep里面
    Dep.target = this
    // 调用get触发依赖收集
    this.vm[key]

    Dep.target = null

  }

  update() {
    this.updater.call(this.vm, this.vm[this.key])
  }
}

