/**@jsx Didact.createElement */
function App(props){
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo"></App>
const container = document.getElementById("root")
Didact.render(element,container)


// function App(props){
//   return Didact.createElement(
//     'h1',
//     null,
//     "Hi ",
//     props.name,
//   )
// }
// const element = Didact.createElement(App,{name:"foo"})

function createDOM (fiber) {
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type)
  const isProperty = key => key != "children"
  Object.keys(fiber.props).filter(isProperty).forEach(name=>{
    dom[name] = fiber.props[name]
  })
  return dom
}

const isEvent = key => key.startWith("on")
const isProperty = key => key != "children" && !isEvent(key)
const isNew = (prev,next) => key => prev[key] != next[key] //新的键 或者 这个键的值改变了
const isGone = (prev,next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps){
  //Remove old or changed event listeners
  Object.keys(prevProps).filter(isEvent).filter(
      key=>!(key in nextProps) || isNew(prevProps,nextProps)(key) //prevProps中有 但是nextProps中没有的属性 或者 nextProps的值改变了
    ).forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType,prevProps[name])
    })
  //Remove old properties
  Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps,nextProps)).forEach(name=>{
    dom[name] = ""
  })
  //Set new or changed properties
  Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps,nextProps)).forEach(name=>{
    dom[name] = nextProps[name]
  })
  //Add event listeners
  Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps,nextProps)).forEach(name => {
    const eventType = name.toLowerCase().substring(2)
    dom.addEventListener(eventType,nextProps[name])
  })
}

function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber){
  if(!fiber){
    return
  }
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom
  if(fiber.effectTag == "PLACEMENT" && fiber.dom != null){
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag == "UPDATE" && fiber.dom != null){
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props,
    )
  } else if (fiber.effectTag == "DELETION"){
    commitDeletion(fiber,domParent)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber,domParent){
  if(fiber.dom){
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.chid,domParent)
  }
}

let nextUnitOfWork = null
let currentRoot = null
let deletions = null
let wipRoot = null

function render(element,container){
  wipRoot = {
    dom:container,
    props:{
      children:[element],
    },
    alternate:currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}

function workLoop(deadline){
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining < 1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber){
  const isFunctionComponent = fiber.type instanceof Function
  if(isFunctionComponent){
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // return next unit of work
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

function updateHostComponent(fiber){
  if(!fiber.dom){
    fiber.dom = createDOM(fiber)
  }

  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
}

function updateFunctionComponent(fiber){
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber,children)
}

function reconcileChildren(wipFiber,elements){ //wipFiber和elements是父子元素关系
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child //wipFiber.alternate 是上一次commit阶段的fiber树的根节点
  let prevSibling = null
  while(index < elements.length || oldFiber != null){
    const element = elements[index]
    let newFiber = null
    //compare oldFiber to element
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
    if(oldFiber && !sameType){
      // delete the oldFiber's node
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    if(index == 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
    index++
  }
}