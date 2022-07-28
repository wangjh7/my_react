我们需要一种数据结构来组织工作单元：fiber树
每个元素都有一个对应的fiber节点 每个fiber节点都是一个工作单元

假设我们想要渲染下面这样一个元素树：
```js
Didact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
)
```

