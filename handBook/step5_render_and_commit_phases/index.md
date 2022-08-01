第四步的performUnitOfWork函数还有一个问题
```js
function performUnitOfWork(fiber) {
  // if (!fiber.dom) {
  //   fiber.dom = createDom(fiber)
  // }
​
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }
​
//   const elements = fiber.props.children
//   let index = 0
//   let prevSibling = null
// ​
//   while (index < elements.length) {
//     const element = elements[index]
// ​
//     const newFiber = {

//     }
//   }
}
```
我们每次调用performUnitOfWork函数时，都会向dom中增加一个新的节点
然后 浏览器是有可能在我们渲染出完整的dom树之前打断渲染的 这样的话 就会有不完整的ui界面呈现给用户 这不是我们想要的效果
所以我们要去掉这里让dom突变的代码

取而代之的是 我们会跟踪fiber树的根节点 我们称之为 **work in progress root** 或者 **wipRoot**
```js
let nextUnitOfWork = null
let wipRoot = null

function render(element,container){
  wipRoot = {
    dom:container,
    props:{
      children:[element],
    },
  }
  nextUnitOfWork = wipRoot
}
```

然后 一旦我们**完成了所有的渲染工作**（如果没有下一个渲染单元 就是完成了） 我们再**将整个fiber树挂载到dom上面**
```js
function commitRoot(){
  //TODO add nodes to dom
}

let nextUnitOfWork = null
let wipRoot = null

function render(element,container){
  wipRoot = {
    dom:container,
    props:{
      children:[element],
    },
  }
  nextUnitOfWork = wipRoot
}

function workLoop(deadline){
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining < 1
  }
  if(!nextUnitOfWork && wipRoot){ //完成了所有的渲染工作
    commitRoot()
  }
  requestIdleCallback(workLoop)
}
```

我们在**commitRoot函数中** 递归地将fiber节点挂载到dom上
```js
function commitRoot(){
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber){
  if(!fiber){
    return
  }
  const domParent = fiber.parent.dom
  domParent.append(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
```