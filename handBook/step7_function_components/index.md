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