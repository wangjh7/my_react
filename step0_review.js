// const element = <h1 title="foo">Hello</h1>
// const element = React.createElement(
//   "h1",
//   {title:"foo"},
//   "Hello",
// )
const element = {
  type:"h1", //想要创建html元素时，type是string类型，指定我们想要创建的DOM节点类型。type也可以是一个函数
  props:{ //props中包含所有JSX标签的键值对
    title:"foo",
    children:"Hello", //props有一个特殊属性：children，childern在这里是string类型，如果JSX标签有多个子元素，children是array类型
  }
}
const container = document.getElementById("root")
// ReactDOM.render(element,container) //把这一行替换成自己的代码
const node = document.createElement(element.type)
node["title"] = element.props.title
const text = document.createTextNode("")
text.nodeValue = element.props.children //这里使用nodeValue属性而不是innerText，是因为在所有dom元素上都可以使用nodeValue属性

node.appendChild(text) //将text挂到node上
container.appendChild(node) //将node挂到container上