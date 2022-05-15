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
 * @property {Array} effects
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
            children: [],
        },
    };
}
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((c) =>
                typeof c === "object" ? c : createTextElement(c)
            ),
        },
    };
}

const Didact = {
    createElement,
    render,
    useState,
    useEffect,
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
            children: [element],
        },
        alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

/**
 * Step III
 * Concurrent mode: make the work breakable
 */
/**@type {Fiber} */
let nextUnitOfWork = null;
/**@type {Fiber} */
let wipRoot = null;
/**@type {Fiber} */
let currentRoot = null;
/**@type {Array<Fiber>} */
let deletions = null;

function workLoop(deadline) {
    let shouldYield = false;
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
    const dom =
        fiber.type === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type);
    Object.keys(fiber.props)
        .filter(isEvent)
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, fiber.props[name]);
        });

    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach((p) => {
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
    const isFunctinoComponent = fiber.type instanceof Function;
    if (isFunctinoComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    // browser may break the render process, so we remove mutate dom operation here
    // if (fiber.parent) {
    //     fiber.parent.dom.appendChild(fiber.dom);
    // }

    // TODO return next unit of work
    if (fiber.child) {
        return fiber.child;
    }
    // find next work and return
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

/**@type {Fiber} */
let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
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
    commitEffects();
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
    let parentFiber = fiber.parent;
    while (!parentFiber.dom) {
        parentFiber = parentFiber.parent;
    }
    const domParent = parentFiber.dom;
    if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, domParent);
    } else if (fiber.effectTag === "UPDATE") {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    flushEffects(fiber);
    commitWork(fiber.sibling);
    commitWork(fiber.child);
}
/**
 *
 * @param {Fiber} fiber
 */
function flushEffects(fiber) {
    if (fiber.effects) {
        const oldFiber = fiber.alternate;
        for (let i = 0; i < fiber.effects.length; i++) {
            if (
                !fiber.alternate ||
                !isArrEleSame(
                    fiber.effects[i].dependiencies,
                    oldFiber.effects[i].dependiencies
                )
            ) {
                effects.push(fiber.effects[i]);
            }
        }
    }
}
const isArrEleSame = (a, b) => {
    let res = true;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            res = false;
        }
    }
    return res;
};
function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
    // Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            (key) =>
                isGone(prevProps, nextProps)(key) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.removeEventListener(eventType, prevProps[name]);
        });
    // add event listener
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, nextProps[name]);
        });

    // Remove old property
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach((name) => (dom[name] = ""));
    // set new or change properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => (dom[name] = nextProps[name]));
}

/**
 * Step VI
 * Reconcilation
 * @param {Fiber} wipFiber
 * @param {Array<object>} elements
 */
function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let prevSibling = null;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    while (index < elements.length || oldFiber) {
        const element = elements[index];
        let newFiber = null;
        // TODO compare oldFiber to element
        const sameType = element && oldFiber && element.type === oldFiber.type;

        if (sameType) {
            // TODO update the node
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        }

        if (element && !sameType) {
            // TODO create new node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
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
        } else if (element) {
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
    const oldHook =
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex];
    const hook = {
        state: oldHook ? oldHook.state : initialValue,
        queue: [],
    };
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
        hook.state = action(hook.state);
    });
    const setState = (action) => {
        hook.queue.push(action);
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    };
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
}

/**
 * Step IX useEffect
 */
let effects = [];

function useEffect(action, dependiencies) {
    if (!wipFiber.effects) {
        wipFiber.effects = [];
    }
    wipFiber.effects.push({ action, dependiencies });
}

function commitEffects() {
    effects.forEach((effect) => {
        effect.action();
    });
    effects = [];
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
    const [state, setState] = Didact.useState(1);
    const [counter, setCounter] = Didact.useState(1);
    Didact.useEffect(() => {
        console.log("state", state);
    }, [state]);
    Didact.useEffect(() => {
        console.log("counter", counter);
    }, [counter, state]);
    return (
        <div>
            <h1 onClick={() => setState((c) => c + 1)}>
                Count: state {state}, counter {counter}
            </h1>
            <h1 onClick={() => setCounter((c) => c + 1)}>Counter Listener</h1>
        </div>
    );
}
const element = <Counter />;
const container = document.getElementById("root");
Didact.render(element, container);
