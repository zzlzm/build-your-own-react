"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Step I: The createElement Function
 * Step II: The render Function
 * Step III: Concurrent Mode
 * Step IV: Fibers
 * Step V: Render and Commit Phases
 * Step VI: Reconciliation
 * Step VII: Function Components
 * Step VIII: Hooks
 */

/**
 *
 * @typedef {Object} Fiber
 * @property {string} type
 * @property {string} effectTag
 * @property {Fiber} parent
 * @property {Fiber} alternate
 * @property {Fiber} child
 * @property {Fiber} sibling
 * @property {object} dom
 * @property {object} props
 * @property {Array} hooks
 */

/**
 * Step I
 * createElement: repalce of React object
 */
function createTextElement(value) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: value,
      children: []
    }
  };
}

function createElement(type, props) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: _objectSpread(_objectSpread({}, props), {}, {
      children: children.map(function (c) {
        return _typeof(c) === "object" ? c : createTextElement(c);
      })
    })
  };
}

var Didact = {
  createElement: createElement,
  render: render,
  useState: useState
};
/**
 * Step II
 * Render: replace of ReactDOM render function
 */
// a unstopable render
// function render(element, container) {
//     const node =
//         element.type === "TEXT_ELEMENT"
//             ? document.createTextNode("")
//             : document.createElement(element.type);
//     const isProperty = (key) => key !== "children";
//     Object.keys(element.props)
//         .filter(isProperty)
//         .forEach((p) => {
//             node[p] = element.props[p];
//         });
//     element.props.children.forEach((c) => {
//         render(c, node);
//     });
//     container.appendChild(node);
// }

/**
 * fiber render
 */

function render(element, container) {
  // TODO set next unit of work
  // set unitOfWork to root of the fiber tree
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}
/**
 * Step III
 * Concurrent mode: make the work breakable
 */

/**@type {Fiber} */


var nextUnitOfWork = null;
/**@type {Fiber} */

var wipRoot = null;
/**@type {Fiber} */

var currentRoot = null;
/**@type {Array<Fiber>} */

var deletions = null;

function workLoop(deadline) {
  var shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 16;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}
/**
 * Step IV
 * Fiber: to support unit work, need a data structure => Fiber tree
 * In the render will create the root fiber, others will be child,
 * perform the rest of work will start at child, if not child then sibling
 */

/**
 *
 * @param {Fiber} fiber
 * @returns
 */


function createDom(fiber) {
  var dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
  Object.keys(fiber.props).filter(isEvent).forEach(function (name) {
    var eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, fiber.props[name]);
  });
  Object.keys(fiber.props).filter(isProperty).forEach(function (p) {
    dom[p] = fiber.props[p];
  });
  return dom;
}
/**
 *
 * @param {Fiber} fiber
 * @returns
 */


function performUnitOfWork(fiber) {
  // TODO add dom node
  var isFunctinoComponent = fiber.type instanceof Function;

  if (isFunctinoComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  } // browser may break the render process, so we remove mutate dom operation here
  // if (fiber.parent) {
  //     fiber.parent.dom.appendChild(fiber.dom);
  // }
  // TODO return next unit of work


  if (fiber.child) {
    return fiber.child;
  } // find next work and return


  var nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}
/**@type {Fiber} */


var wipFiber = null;
var hookIndex = null;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  var children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
/**
 *
 * @param {Fiber} fiber
 */


function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}
/**
 * Step V
 * Render and commit
 */


function commitRoot() {
  // TODO add nodes to dom
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}
/**
 *
 * @param {Fiber} fiber
 * @returns
 */


function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  var parentFiber = fiber.parent;

  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent;
  }

  var domParent = parentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === "UPDATE") {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.sibling);
  commitWork(fiber.child);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

var isEvent = function isEvent(key) {
  return key.startsWith("on");
};

var isProperty = function isProperty(key) {
  return key !== "children" && !isEvent(key);
};

var isNew = function isNew(prev, next) {
  return function (key) {
    return prev[key] !== next[key];
  };
};

var isGone = function isGone(prev, next) {
  return function (key) {
    return !(key in next);
  };
};

function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps).filter(isEvent).filter(function (key) {
    return isGone(prevProps, nextProps)(key) || isNew(prevProps, nextProps)(key);
  }).forEach(function (name) {
    var eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  }); // add event listener

  Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(function (name) {
    var eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  }); // Remove old property

  Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(function (name) {
    return dom[name] = "";
  }); // set new or change properties

  Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(function (name) {
    return dom[name] = nextProps[name];
  });
}
/**
 * Step VI
 * Reconcilation
 * @param {Fiber} wipFiber
 * @param {Array<object>} elements
 */


function reconcileChildren(wipFiber, elements) {
  var index = 0;
  var prevSibling = null;
  var oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  while (index < elements.length || oldFiber) {
    var _element = elements[index];
    var newFiber = null; // TODO compare oldFiber to element

    var sameType = _element && oldFiber && _element.type === oldFiber.type;

    if (sameType) {
      // TODO update the node
      newFiber = {
        type: oldFiber.type,
        props: _element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      };
    }

    if (_element && !sameType) {
      // TODO create new node
      newFiber = {
        type: _element.type,
        props: _element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      };
    }

    if (oldFiber && !sameType) {
      // TODO delete old fiber's node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (_element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
/**
 * Step VII Function component
 * @see performUnitOfWork
 * @see commitWork
 */

/**
 * Step VIII Hooks
 * @see updateFunctionComponent
 */


function useState(initialValue) {
  var oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  var hook = {
    state: oldHook ? oldHook.state : initialValue,
    queue: []
  };
  var actions = oldHook ? oldHook.queue : [];
  actions.forEach(function (action) {
    hook.state = action(hook.state);
  });

  var setState = function setState(action) {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
/**
 * entry point
 */


requestIdleCallback(workLoop);
/** @jsx Didact.createElement */

/**
 * Basic Demo
 */
// const element = (
//     <div style="background: salmon">
//         <h1>Hello World</h1>
//         <h2 style="text-align:right">from Didact</h2>
//     </div>
// );
// const container = document.getElementById("root");
// Didact.render(element, container);

/**
 * Update Demo
 */
// const inputContainer = document.getElementById("inputRoot");
// const updateValue = (e) => {
//     inputRender(e.target.value);
// };
// const inputRender = (value) => {
//     const inputEle = (
//         <div>
//             <input onInput={updateValue} value={value} />
//             <h2>Hello {value}</h2>
//         </div>
//     );
//     Didact.render(inputEle, inputContainer);
// };
// inputRender("World");

/**
 * Function component demo
 */
// function App(props) {
//     return <h1>Hi {props.name}</h1>;
// }
// const element = <App name="foo" />;
// const container = document.getElementById("root");
// Didact.render(element, container);

/**
 * Hooks demo
 */

function Counter() {
  var _Didact$useState = Didact.useState(1),
      _Didact$useState2 = _slicedToArray(_Didact$useState, 2),
      state = _Didact$useState2[0],
      setState = _Didact$useState2[1];

  return Didact.createElement("h1", {
    onClick: function onClick() {
      return setState(function (c) {
        return c + 1;
      });
    }
  }, "Count: ", state);
}

var element = Didact.createElement(Counter, null);
var container = document.getElementById("root");
Didact.render(element, container);