接下来我们要增加对函数组件的支持

首页我们改一下用例 我们有一个函数组件 它返回一个h1元素
```js
/**@jsx Didact.createElement */
function App(props){
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo"></App>
const container = document.getElementById("root")
Didact.render(element,container)
```
如果我们把jsx转换成js 它会变成下面这样子
```js
function App(props){
  return Didact.createElement(
    'h1',
    null,
    "Hi ",
    props.name,
  )
}
const element = Didact.createElement(App,{name:"foo"})
```

函数组件有两点不同：
- 函数组件的fiber节点 没有dom节点
- 函数组件的children 来自于函数组件的返回值 而不是直接从props里取

在performUnitOfWork函数中 我们判断fiber的类型是否为function 根据结果会去到两个不同的更新函数中

```js
function performUnitOfWork(fiber){
  const isFunctionComponent = fiber.type instanceof Function
  if(isFunctionComponent){
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // if(fiber.child){
  //   return fiber.child
  // }
  // let nextFiber = fiber
  // while(nextFiber){
  //   if(nextFiber.sibling){
  //     return nextFiber.sibling
  //   }
  //   nextFiber = fiber.parent
  // }
}

function updateHostComponent(fiber){
  if(!fiber.dom){
    fiber.dom = createDOM(fiber)
  }

  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
}

function updateFunctionComponent(fiber){
  //TODO
}
```
在**updateHostComponent函数**中运行和之前一样的逻辑

```js
function updateFunctionComponent(fiber){
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber,children)
}
```
在**updateFunctionComponent**中 我们调用函数组件 拿到函数组件的children
在我们的例子中 这里的fiber.type就是App函数 调用App函数 返回了h1元素
我们拿到children之后 reconciliation和之前一样工作 这里不用再修改reconcileChildren函数

我们需要修改的是**commitWork函数**
现在我们有没有dom的fiber 我们需要修改两点

```js
function commitWork(fiber){
  // if(!fiber){
  //   return
  // }
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom
  // if(fiber.effectTag == "PLACEMENT" && fiber.dom != null){
    domParent.appendChild(fiber.dom)
  // }
}
```
1. 为了找到父dom节点 我们需要在fiber树上向上查找 直到找到一个有dom节点的fiber

```js
function commitWork(fiber){
  // if(!fiber){
  //   return
  // }
  // let domParentFiber = fiber.parent
  // while(!domParentFiber.dom){
  //   domParentFiber = domParentFiber.parent
  // }
  // const domParent = domParentFiber.dom
  // if(fiber.effectTag == "PLACEMENT" && fiber.dom != null){
  //   domParent.appendChild(fiber.dom)
  // } else if (fiber.effectTag == "UPDATE" && fiber.dom != null){
  //   updateDom(
  //     fiber.dom,
  //     fiber.alternate.props,
  //     fiber.props,
  //   )
  // } 
  else if (fiber.effectTag == "DELETION"){
    commitDeletion(fiber,domParent)
  }
  // commitWork(fiber.child)
  // commitWork(fiber.sibling)
}

function commitDeletion(fiber,domParent){
  if(fiber.dom){
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.chid,domParent)
  }
}
```
2. 删除一个dom节点的时候 我们也需要持续向下查找 直到找到一个带有dom节点的fiber