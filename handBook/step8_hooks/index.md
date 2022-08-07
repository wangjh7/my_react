现在我们有了函数组件 我们来给函数组件增加状态

我们把用例改成经典的counter组件 每次点击 状态值加一
```js
const Didact = {
  createElement,
  render,
  useState,
}
/** @jsx Didact.createElement */
function Counter(){
  const [state,setState] = Didact.useState(1)
  return (
    <h1 onClick={() => setState(c => c + 1)}>
      Count:{state}
    </h1>
  )
}

const element = <Counter />
const container = document.getElementById("root")
Didact.render(element, container)
```
我们使用Didact.useState来获取和更新counter的值

```js
function updateFunctionComponent(fiber){
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber,children)
}

function useState(initial){
  //TODO
}
```
我们会在fiber.type(fiber.props)调用我们例子中的Counter函数 在Counter函数中我们调用了useState

```js
let theWipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber){
  theWipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber,children)
}
```
在调用函数组件之前 我们需要初始化一些全局变量 我们之后可以在**useState**中用到这些变量
首先 我们声明了work in progress fiber
然后 我们在fiber增加了一个hooks属性 它的值是一个数组 这是为了支持在同一个组件中调用多次useState
然后 我们声明hookIndex用来保存当前hook的下标（hook index）

```js
function useState(initial){
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state:oldHook? oldHook.state :initial,
  }
  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state]
}
```
函数组件调用useState的时候 我们要先检查是否有旧的hook
因为alternate fiber是旧的fiber 所以我们用hook index在alternate fiber上检查
如果存在旧的hook 我们把旧的hook的状态复制给新的hook 如果没有旧的hook 使用hook的初始值
然后我们把新的hook放到fiber上 增加hookIndex 返回状态

```js
function useState(initial){
  // const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  const hook = {
    // state:oldHook? oldHook.state :initial,
    queue:[],
  }
  const setState = (action)=>{
    hook.queue.push(action)
    wipRoot = {
      dom:currentRoot.dom,
      props:currentRoot.props,
      alternate:currentRoot
    }
    nextUnitOfWork = wipRoot
    deletions=[]
  }
  // wipFiber.hooks.push(hook)
  // hookIndex++
  return [hook.state,setState]
}
```
useState还需要返回一个函数用来更新状态 所以我们定义一个setState函数 它接收一个action（在这个Counter用例中 这个action就是让状态加1的函数）
我们把这个action放到hook上的一个队列中
接下来和render函数中相似 设置一个新的work in progress root作为下一个工作单元 然后workLoop可以开始一个新的render阶段

```js
function useState(initial){
  // const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  // const hook = {
  //   state:oldHook? oldHook.state :initial,
  //   queue:[],
  // }
  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action=>{
    hook.state = action(hook.state)
  })
  // const setState = (action)=>{
  //   hook.queue.push(action)
  //   wipRoot = {
  //     dom:currentRoot.dom,
  //     props:currentRoot.props,
  //     alternate:currentRoot
  //   }
  //   nextUnitOfWork = wipRoot
  //   deletions=[]
  // }
  // wipFiber.hooks.push(hook)
  // hookIndex++
  // return [hook.state,setState]
}
```
但是我们还没有运行action呢
我们在下一次render这个组件的时候运行action 从老的hook队列中拿到所有action 然后一个接一个把新的hook状态传给action 所以我们在action中返回状态之后 hook的状态就更新了