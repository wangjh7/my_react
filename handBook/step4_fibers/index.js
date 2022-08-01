function createDOM (fiber) {
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type)
  const isProperty = key => key != "children"
  Object.keys(fiber.props).filter(isProperty).forEach(name=>{
    dom[name] = fiber.props[name]
  })
  return dom
}

let nextUnitOfWork = null

function render(element,container){
  nextUnitOfWork = {
    dom:container,
    props:{
      children:[element],
    },
  }
}

function workLoop(deadline){
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber){
  // TODO add dom node
  if(!fiber.dom){
    fiber.dom = createDOM(fiber)
  }
  if(fiber.parent){
    fiber.parent.dom.appendChild(fiber.dom)
  }
  // TODO create new fibers
  const elements = fiber.props.children
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