import React from 'react';
import { Portal } from 'react-portal';

export const insertPositions = {
  after: 'afterend',
  before: 'beforebegin',
};

export class EuiPortal extends React.Component {
  portalNode;
  constructor(props) {
    super(props);

    const { insert } = this.props;

    this.portalNode = document.createElement('div');

    if (insert == null) {
      // no insertion defined, append to body
      document.body.appendChild(this.portalNode);
    } else {
      // inserting before or after an element
      const { sibling, position } = insert;
      sibling.insertAdjacentElement(insertPositions[position], this.portalNode);
    }
  }

  componentDidMount() {
    this.updatePortalRef(this.portalNode);
  }

  componentWillUnmount() {
    if (this.portalNode.parentNode) {
      this.portalNode.parentNode.removeChild(this.portalNode);
    }
    this.updatePortalRef(null);
  }

  updatePortalRef(ref) {
    if (this.props.portalRef) {
      this.props.portalRef(ref);
    }
  }

  render() {
    return(
      <Portal node={this.portalNode}>
        {this.props.children}
      </Portal>
    );
  }
}
