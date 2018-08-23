const Root = {
  createElement(type, props, children) {
    /**
     * Creates a new element.
     *
     * @param type - the type of the element
     * @param props - a JS object representing the element's properties
     * @param children - [optional] the child node of this element
     * @returns {any} - a JS object-based representation of the element
     * **/
    const element = {
      type,
      props: props || {}
    };

    if (children) {
      element.props.children = children;
    }

    return element;
  },

  createClass(spec) {
    function Constructor(props) {
      this.props = props;
    }

    Constructor.prototype = Object.assign(Constructor.prototype, spec);

    return Constructor;
  },

  render(element, container) {
    /**
     * A wrapper around mountComponent.
     *
     * @param element - a Root element
     * @param container -
     * @returns {any} -
     * **/
    const prevComponent = getTopLevelComponentInContainer(container);
    if (prevComponent) {
      return updateRootComponent(
        prevComponent,
        element
      );
    } else {
      return renderNewRootComponent(element, container);
    }
  }
};

function renderNewRootComponent(element, container) {
  const wrapperElement = Root.createElement(TopLevelWrapper);
  const componentInstance = new RootCompositeComponentWrapper(wrapperElement);
  const markUp = RootReconciler.mountComponent(
    componentInstance,
    container
  );

  container.__rootComponentInstance = componentInstance._renderedComponent;

  return markUp;
}

function getTopLevelComponentInContainer(container) {
  return container.__rootComponentInstance;
}

function updateRootComponent(prevComponent, nextElement) {
  RootReconciler.receiveComponent(prevComponent, nextElement);
}

class RootDOMComponent {
  constructor(element) {
    this._currentElement = element;
  }

  mountComponent(container) {
    /**
     * Mounts an element to the DOM.
     *
     * @param container -
     * @returns - the DOM element that was created
     * **/
    const domElement = document.createElement(this._currentElement.type);
    const text = this._currentElement.props.children; // check for undefined here
    const textNode = document.createTextNode(text);
    domElement.appendChild(textNode);

    container.appendChild(domElement);

    this._hostNode = domElement;
    return domElement;
  }

  receiveComponent(next) {
    const prevElement = this._currentElement;
    this.updateComponent(prevElement, nextElement);
  }

  updateComponent(prevElement, nextElement) {
    const lastProps = prevElement.props;
    const nextProps = nextElement.props;

    this._updateDOMProperties(lastProps, nextProps);
    this._updateDOMChildren(lastProps, nextProps);

    this._currentElement = nextElement;
  }

  _updateDOMProperties(lastProps, nextProps) {
    // mostly concerned with updating CSS styles
  }

  _updateDOMChildren(lastProps, nextProps) {
    const lastContent = lastProps.children;
    const nextContent = nextProps.children;

    if (!nextContent) {
      this.updateTextContent('');
    } else if (lastContent !== nextContent) {
      this.updateTextContent('' + nextContent);
    }
  }

  updateTextContent(text) {
    const node = this._hostNode;
    const firstChild = node.firstChild;

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === 3) {
      firstChild.nodeValue = text;
      return;
    }

    node.textContent = text;
  }
}

const TopLevelWrapper = function(props) {
  this.props = props;
};

TopLevelWrapper.prototype.render = function() {
  return this.props;
};

class RootCompositeComponentWrapper {
  constructor(element) {
    this._currentElement = element;
  }

  mountComponent(container) {
    const Component = this._currentElement.type;
    const componentInstance = new Component(this._currentElement.props);
    this._instance = componentInstance;

    if (componentInstance.componentWillMount) {
      componentInstance.componentWillMount();
    }

    const markup = this.performInitialMount(container);

    if (componentInstance.componentDidMount) {
      componentInstance.componentDidMount();
    }

    return markup;
  }

  performInitialMount(container) {
    const renderedElement = this._instance.render();

    const child = instantiateRootComponent(renderedElement);
    this._renderedComponent = child;

    return RootReconciler.mountComponent(child, container);
  }

  receiveComponent(nextElement) {
    const prevElement = this._currentElement;
    this.updateComponent(prevElement, nextElement);
  }

  updateComponent(prevElement, nextElement) {
    const nextProps = nextElement.props;
    const inst = this._instance;

    if (inst.componentWillReceiveProps) {
      inst.componentWillReceiveProps(nextProps);
    }

    let shouldUpdate = true;

    if (inst.shouldComponentUpdate) {
      shouldUpdate = inst.shouldComponentUpdate(nextProps);
    }

    if (shouldUpdate) {
      this._performComponentUpdate(nextElement, nextProps);
    } else {
      // if skipping update, still need to set lastest props
      inst.props = nextProps;
    }
  }

  _performComponentUpdate(nextElement, nextProps) {
    this._currentElement = nextElement;
    const inst = this._instance;

    inst.props = nextProps;

    this._updateRenderedComponent();
  }

  _updateRenderedComponent() {
    const prevComponentInstance = this._renderedComponent;
    const inst = this._instance;
    const nextRenderedElement = inst.render();

    RootReconciler.receiveComponent(prevComponentInstance, nextRenderedElement);
  }

}

const RootReconciler = {
  // now responsible for mounting
  mountComponent(internalInstance, container) {
    return internalInstance.mountComponent(container);
  },

  receiveComponent(internalInstance, nextElement) {
    internalInstance.receiveComponent(nextElement);
  }
};

function instantiateRootComponent(element) {
  if (typeof element.type === 'string') {
    return new RootDOMComponent(element);
  } else if (typeof element.type === 'function') {
    return new RootCompositeComponentWrapper(element);
  }
}



export default Root;
