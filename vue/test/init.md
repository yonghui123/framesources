src/platforms/web/entry-runtime-with-compiler.js 
- 打包入口文件
- 扩展$mount,处理template或者el选项


src\platforms\web\runtime\index.js
- 安装补丁函数 vdom -> dom
- 实现$mount:生成真实dom，并将dom挂载到宿主元素中

\src\core\index.js
- 初始化全局静态api

\src\core\instance\index.js
- 构造函数声明
- 初始化实例方法和属性

\src\core\instance\init.js 


