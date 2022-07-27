这一步我们来实现ReactDOM.render
现在只关心往DOM中增加元素，之后再处理更新和删除

1. 根据元素类型创建DOM节点，并且将节点挂载到container上
``` js
function render(element,container){
  const dom = document.createElement(element.type)
  container.appendChild(dom)
}
```

2. 在每一个child上递归地做同样的事情
```js
function render(element,container){
  const dom = document.createElement(element.type)

  element.props.children.forEach((child)=>{
    render(child,dom)
  })

  container.appendChild(dom)
}
```

3. 还得处理一下文本元素，如果元素类型是TEXT_ELEMENT，我们创建一个文本节点，而不是常规的dom节点
```js
function render(element,container){

  const dom = element.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type)

  element.props.children.forEach((child)=>{
    render(child,dom)
  })
  container.appendChild(dom)
}
```

4. 最后我们要把元素的属性赋值到dom节点上
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

5. 现在我们完成了一个把jsx渲染成dom的库