```js
function render(element,container){
  const dom = element.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type)

  const isProperty = key => key != "children"
  Object.keys(element.props).filter(isProperty).forEach(name=>{
    dom[name] = element.props[name]
  })
  
  element.props.children.forEach((child)=>{
    render(child,dom)
  })
  container.appendChild(dom)
}
```

在开始之前 我们需要对render函数进行重构
上面的render函数中的递归调用有一个问题
问题在于 一旦我们开始运行render函数  这个函数就不会停止 直到渲染出完整的元素树
如果这个元素树很大 render函数的运行会阻塞主线程很长时间 并且如果浏览器需要做一些高优先级的任务 比如处理用户输入或者保持一个动画顺滑 这些任务必须等待render函数执行完成之后才能开始

所以我们将要把render函数的任务拆分成一个个小的单元 在render函数执行的过程中 如果浏览器有任何高优先级的任务要处理 我们要允许浏览器打断render函数的执行 直到所有的单元都执行完毕
```js
let nextUnitOfWork = null
function workLoop(deadline){
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork){
  //TODO
}
```
我们使用[requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)来进行了循环调用 可以把它当成setTimeout 只不过不是我们告诉它什么时候去执行回调函数 而是当主线程空闲时 浏览器就会运行回调函数
[React不再使用requestIdleCallback了](https://github.com/facebook/react/issues/11171#issuecomment-417349573) 它现在使用scheduler包 但是现在这种使用场景下 两者在概念上是一样的