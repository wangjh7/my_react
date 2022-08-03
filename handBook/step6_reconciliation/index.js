function createDOM (fiber) {
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type)
  const isProperty = key => key != "children"
  Object.keys(fiber.props).filter(isProperty).forEach(name=>{
    dom[name] = fiber.props[name]
  })
  return dom
}

function commitRoot(){
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber){
  if(!fiber){
    return
  }
  const domParent = fiber.parent.dom
  domParent.append(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null

function render(element,container){
  wipRoot = {
    dom:container,
    props:{
      children:[element],
    },
    alternate:currentRoot,
  }
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
      //TODO delete the oldFiber's node
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