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
    const wrapperElement = this.createElement(TopLevelWrapper, element);
    const componentInstance = new RootCompositeComponentWrapper(wrapperElement);
    return componentInstance.mountComponent(componentInstance, container);
  }
};

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
}

const RootReconciler = {
  // now responsible for mounting
  mountComponent(internalInstance, container) {
    return internalInstance.mountComponent(container);
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
