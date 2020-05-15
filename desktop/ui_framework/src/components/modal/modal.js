import React, {
  Component,
} from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';

import { keyCodes } from '../../services';

export class KuiModal extends Component {
  onKeyDown = event => {
    if (event.keyCode === keyCodes.ESCAPE) {
      this.props.onClose();
    }
  };

  render() {
    const {
      className,
      children,
      onClose, // eslint-disable-line no-unused-vars
      ...rest
    } = this.props;

    const classes = classnames('kuiModal', className);

    // If the props 'clickOutsideToCloseModal' is set to false
    // we will not close the modal when clicked outside the modal area.
    let clickOutsideToCloseModal = undefined;
    if(this.props.clickOutsideToCloseModal === false) {
      clickOutsideToCloseModal = this.props.clickOutsideToCloseModal;

    // If the props 'clickOutsideToCloseModal' is not set or set to true
    // we will close the modal when clicked outside the modal area.
    } else {
      clickOutsideToCloseModal = true;
    }

    return (
      <FocusTrap
        focusTrapOptions={{
          fallbackFocus: () => this.modal,
          // This is added to close the modal when
          // clicked outside.
          onDeactivate: () => this.props.onClose(),
          clickOutsideDeactivates: clickOutsideToCloseModal
        }}
      >
        {
          // Create a child div instead of applying these props directly to FocusTrap, or else
          // fallbackFocus won't work.
        }
        <div
          ref={node => { this.modal = node; }}
          className={classes}
          onKeyDown={this.onKeyDown}
          tabIndex={0}
          {...rest}
        >
          {children}
        </div>
      </FocusTrap>
    );
  }
}

KuiModal.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,

  // Used this to enable or disable close of modal on clicking outside of modal
  clickOutsideToCloseModal: PropTypes.bool
};
