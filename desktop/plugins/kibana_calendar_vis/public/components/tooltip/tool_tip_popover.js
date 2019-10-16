import React, { Component } from 'react';
import classNames from 'classnames';

export class EuiToolTipPopover extends Component {
  popover = undefined;

  updateDimensions = () => {
    requestAnimationFrame(() => {
      // Because of this delay, sometimes `positionToolTip` becomes unavailable.
      if (this.popover) {
        this.props.positionToolTip(this.popover.getBoundingClientRect());
      }
    });
  };

  setPopoverRef = (ref) => {
    this.popover = ref;
    if (this.props.popoverRef) {
      this.props.popoverRef(ref);
    }
  };

  componentDidMount() {
    document.body.classList.add('euiBody-hasPortalContent');

    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    document.body.classList.remove('euiBody-hasPortalContent');
    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    const {
      children,
      title,
      className,
      ...rest
    } = this.props;

    const classes = classNames('euiToolTipPopover', className);

    let optionalTitle;
    if (title) {
      optionalTitle = <div className="euiToolTip__title">{title}</div>;
    }

    return (
      <div className={classes} ref={this.setPopoverRef} {...rest}>
        {optionalTitle}
        {children}
      </div>
    );
  }
}
