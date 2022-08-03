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

我们在**reconcileChildren函数**中协调旧fiber和新元素（**diff算法**）
```js
function reconcileChildren(wipFiber,elements){
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null
  while(index < elements.length || oldFiber != null){
    const element = elements[index]
    let newFiber = null
    //TODO compare oldFiber to element
    
  }
}
```
我们同时遍历旧fiber树的children 和 我们想要diff的元素组成的数组
element是我们想要渲染到DOM上的东西 oldFiber是我们上一次渲染出来的东西
我们需要比较二者 来看看是否需要修改dom

```js
function reconcileChildren(wipFiber,elements){
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null
  while(index < elements.length || oldFiber != null){
    const element = elements[index]
    let newFiber = null
    //compare oldFiber to element
    const sameType = oldFiber && element && element.type == oldFiber.type
    if(sameType){
      //TODO update the node
    } 
    if (element && !sameType){
      //TODO add this node
    }
    if(oldFiber && !sameType){
      //TODO delete the oldFiber's node
    }
  }
}
```
我们利用类型来进行比较：
- 如果旧的fiber和新的元素有相同的类型 我们保留这个dom节点 把新的属性更新上去
- 如果类型不相同 而且有新的元素 这意味着我们要创建一个新的dom节点
- 如果类型不同 而且有老的fiber 我们要删除对应的dom节点

*React在这里利用key 来实现了性能更好的协调 它会检查chilren在元素树组中位置的变化*

```js
const sameType = oldFiber && element && element.type == oldFiber.type
if(sameType){
  // update the node
  newFiber = {
    type:oldFiber.type,
    props:element.props,
    dom:oldFiber.dom,
    parent:wipFiber,
    alternate:oldFiber,
    effectTag:"UPDATE",
  }
} 
```
旧的fiber和新的元素有相同类型的时候 我们创建一个新的fiber dom属性保留旧fiber的dom props属性为新的元素的props 我们还增加了一个effectTag属性 在commit阶段会用到这个属性

```js
if (element && !sameType){
  // add this node
  newFiber = {
    type:element.type,
    props:element.props,
    dom:null,
    parent:wipFiber,
    alternate:null,
    effectTag:"PLACEMENT",
  }
}
```
像这种需要创建新的dom节点的情况 我们将新的fiber的effectTag属性标记为PLACEMENT