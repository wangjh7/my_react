//在这一步中，我们手写一个createElement函数
// const element = React.createElement(
//   "div",
//   {id:"foo"},
//   React.createElement("a",null,"bar"),
//   React.createElement("b")
// )
//上一步中我们讲到过，一个react元素就是一个有type和props属性的对象，我们的createElement函数也只需要创建这样的对象即可

function createElement (type,props,...children) { //使用rest parameter，这样children一直是array类型
  return {
    type,
    props:{
      ...props,
      children:children.map((child)=>(
        typeof child == "object" //children数组可能包含原始类型的值，比如string或number
        ? child
        : createTextElement(child) //将原始类型的值，封装为和react元素结构相同的对象，并赋予其一个特殊的类型：TEXT_ELEMENT
      )),
    },
  }
}

function createTextElement (text) {
  return {
    type:"TEXT_ELEMENT",
    props:{
      nodeValues:text,
      children:[], //React没有封装原始类型的值，没有children时也没有创建一个空数组，我们这么做是为了简化代码
    }
  }
}

const Didact = { //我们的React叫做Didact
  createElement,
}
const element = Didact.createElement(
  "div",
  {id:"foo"},
  Didact.createElement("a",null,"bar"),
  Didact.createElement("b")
)

//jsx编译的时候 怎么让babel使用Didact.createElement 而不是React呢？
//使用下面的注释，babel编译jsx时会使用Didact.createElement

/** @jsx Didact.createElement */
const demo = (
  <div id="foo">
    <a>bar</a>
    <b/>
  </div>
)