```js
function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}
​
function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
```
目前位置 我们只完成了往DOM树上挂载节点 还不能更新和删除节点
我们需要比较 传进render函数的元素 和 上一次我们挂载到DOM上的fiber树 之间的差别
所以我们需要在挂载完成之后 保存一个“上次挂载到DOM上的fiber树”的指引 我们称之为**currentRoot**
```js
function commitRoot(){
  // commitWork(wipRoot.child)
  currentRoot = wipRoot
  // wipRoot = null
}

// function commitWork(fiber){
//   if(!fiber){
//     return
//   }
//   const domParent = fiber.parent.dom
//   domParent.append(fiber.dom)
//   commitWork(fiber.child)
//   commitWork(fiber.sibling)
// }

// let nextUnitOfWork = null
let currentRoot = null
// let wipRoot = null

function render(element,container){
  wipRoot = {
//     dom:container,
//     props:{
//       children:[element],
//     },
    alternate:currentRoot,
  }
//   nextUnitOfWork = wipRoot
}
```
我们还在每一个fiber节点上增加了alternate属性 这个属性指向了旧的fiber 就是在上一次挂载阶段 挂载到DOM上的fiber树

接下来 我们将performUnitOfWork函数中创建新的fiber节点的逻辑提取出来 放到一个新函数**reconcileChildren**中
```js
function performUnitOfWork(fiber){
  // TODO add dom node
  if(!fiber.dom){
    fiber.dom = createDOM(fiber)
  }

  const elements = fiber.props.children
  reconcileChildren(fiber, elements)

  // TODO return next unit of work
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = fiber.parent
  }
}
function reconcileChildren(wipFiber,elements){
  let index = 0
  let prevSibling = null
  while(index < elements.length){
    const element = elements[index]
    const newFiber = {
      type:element.type,
      props:element.props,
      parent:fiber,
      dom:null,
    }
    if(index == 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}
```

我们在reconcileChildren函数中协调旧fiber和新元素（**diff算法**）