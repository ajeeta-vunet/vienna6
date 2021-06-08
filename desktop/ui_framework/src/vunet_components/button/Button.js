import React, { Component } from 'react';
import './Button.less';

class Button extends Component{

    render(){
        return(
            <button className={`${this.props.type}`} id={this.props.id} onClick={(e) => this.props.onClick(e)}>
                {this.props.text}
            </button>
        )
    }
}

export default Button;