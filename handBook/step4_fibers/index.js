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
  if(!fiber.dom){
    fiber.dom = createDOM(fiber)
  }
  if(fiber.parent){
    fiber.parent.dom.appendChild(fiber.dom)
  }
  // TODO create new fibers
  // TODO return next unit of work
}