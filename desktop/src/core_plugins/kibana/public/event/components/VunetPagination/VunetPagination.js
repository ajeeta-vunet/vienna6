
// ------------------------- NOTICE ------------------------------- //
//                                                                  //
//                   CONFIDENTIAL INFORMATION                       //
//                   ------------------------                       //
//     This Document contains Confidential Information or           //
//     Trade Secrets, or both, which are the property of VuNet      //
//     Systems Ltd.  This document may not be copied, reproduced,   //
//     reduced to any electronic medium or machine readable form    //
//     or otherwise duplicated and the information herein may not   //
//     be used, disseminated or otherwise disclosed, except with    //
//     the prior written consent of VuNet Systems Ltd.              //
//                                                                  //
// ------------------------- NOTICE ------------------------------- //

// Copyright 2020 VuNet Systems Ltd.
// All rights reserved.
// Use of copyright notice does not imply publication.

import React from 'react';
import './VunetPagination.less';
import $ from 'jquery';

export class VunetPagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //upperPageBound - used to figure out which events to show. keep it the same as eventsPerPage
      upperPageBound: 10,

      //lowerPageBound - used to figure out which events to show. Keep as 0
      lowerPageBound: 0,

      //isPrevBtnActive - used to check if prev button will be disabled or not
      isPrevBtnActive: 'disabled',

      //isNextBtnActive - used to check if prev button will be disabled or not
      isNextBtnActive: '',

      //pageBound - used to figure out which events to show. keep it the same as eventsPerPage
      pageBound: 10,
    };
  }


  componentDidMount() {
    if (this.props.events.length <= this.props.eventsPerPage) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ isNextBtnActive: 'disabled' });
    }
  }

  componentDidUpdate() {
    $('ul li.active').removeClass('active');
    $('ul li#' + this.props.currentPage).addClass('active');
    $('#page-numbers li a').on('click', function (e) {
      e.preventDefault();
    });
  }

  //pagination: this function is used to handle clicks for pagination.
  //it will update the currentPage and add/remove the active class.
  handleClick = (event) => {
    const listid = Number(event.target.id);
    // this.setState({
    //   currentPage: listid
    // });
    this.handlePageChange(listid);
    $('ul li.active').removeClass('active');
    $('ul li#' + listid).addClass('active');
    this.setPrevAndNextBtnClass(listid);
  }

  //pagination: this function is used to decide whether the prev/next buttons will be disabled or not
  setPrevAndNextBtnClass = (listid) => {
    const totalPage = Math.ceil(this.props.events.length / this.props.eventsPerPage);
    this.setState({ isNextBtnActive: 'disabled' });
    this.setState({ isPrevBtnActive: 'disabled' });
    if (totalPage === listid && totalPage > 1) {
      this.setState({ isPrevBtnActive: '' });
    }
    else if (listid === 1 && totalPage > 1) {
      this.setState({ isNextBtnActive: '' });
    }
    else if (totalPage > 1) {
      this.setState({ isNextBtnActive: '' });
      this.setState({ isPrevBtnActive: '' });
    }
  }

  //pagination: used to calculate the bounds of events to be displayed when moved to next page
  btnIncrementClick = () => {
    this.setState({ upperPageBound: this.state.upperPageBound + this.state.pageBound });
    this.setState({ lowerPageBound: this.state.lowerPageBound + this.state.pageBound });
    const listid = this.state.upperPageBound + 1;
    //this.setState({ currentPage: listid });
    this.handlePageChange(listid);
    this.setPrevAndNextBtnClass(listid);
  }

  //pagination: used to calculate the bounds of events to be displayed when moved to prev page
  btnDecrementClick = () => {
    this.setState({ upperPageBound: this.state.upperPageBound - this.state.pageBound });
    this.setState({ lowerPageBound: this.state.lowerPageBound - this.state.pageBound });
    const listid = this.state.upperPageBound - this.state.pageBound;
    //this.setState({ currentPage: listid });
    this.handlePageChange(listid);
    this.setPrevAndNextBtnClass(listid);
  }

  //pagination: function called when previous button is called
  btnPrevClick = () => {
    if ((this.props.currentPage - 1) % this.state.pageBound === 0) {
      this.setState({ upperPageBound: this.state.upperPageBound - this.state.pageBound });
      this.setState({ lowerPageBound: this.state.lowerPageBound - this.state.pageBound });
    }

    const listid = this.props.currentPage - 1;
    //this.setState({ currentPage: listid });
    this.handlePageChange(listid);
    this.setPrevAndNextBtnClass(listid);
  }

  //pagination: function called when next button is called
  btnNextClick = () => {
    if ((this.props.currentPage + 1) > this.state.upperPageBound) {
      this.setState({ upperPageBound: this.state.upperPageBound + this.state.pageBound });
      this.setState({ lowerPageBound: this.state.lowerPageBound + this.state.pageBound });
    }

    const listid = this.props.currentPage + 1;
    //this.setState({ currentPage: listid });
    this.handlePageChange(listid);
    this.setPrevAndNextBtnClass(listid);
  }

  handlePageChange = (listid) => {
    this.props.handlePageChange(listid);
  }

  render() {
    // Logic for displaying page numbers
    const { upperPageBound,
      lowerPageBound, isPrevBtnActive, isNextBtnActive } = this.state;

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(this.props.events.length / this.props.eventsPerPage); i++) {
      pageNumbers.push(i);
    }

    //function used to render page nos.
    const renderPageNumbers = pageNumbers.map(number => {
      if (number === 1 && this.props.currentPage === 1) {
        return (
          <li key={number} className="active" id={number}><a href="#" id={number} onClick={this.handleClick}>{number}</a></li>
        );
      }
      else if ((number < upperPageBound + 1) && number > lowerPageBound) {
        return (
          <li key={number} id={number}><a href="#" id={number} onClick={this.handleClick}>{number}</a></li>
        );
      }
    });

    let pageIncrementBtn = null;
    if (pageNumbers.length > upperPageBound) {
      pageIncrementBtn = <li className=""><a href="#" onClick={this.btnIncrementClick}> &hellip; </a></li>;
    }

    let pageDecrementBtn = null;
    if (lowerPageBound >= 1) {
      pageDecrementBtn = <li className=""><a href="#" onClick={this.btnDecrementClick}> &hellip; </a></li>;
    }

    let renderPrevBtn = null;
    if (isPrevBtnActive === 'disabled') {
      renderPrevBtn = <li className={isPrevBtnActive}><span id="btnPrev"> Prev </span></li>;
    }
    else {
      renderPrevBtn = <li className={isPrevBtnActive}><a href="#" id="btnPrev" onClick={this.btnPrevClick}> Prev </a></li>;
    }

    let renderNextBtn = null;
    if (isNextBtnActive === 'disabled') {
      renderNextBtn = <li className={isNextBtnActive}><span id="btnNext"> Next </span></li>;
    }
    else {
      renderNextBtn = <li className={isNextBtnActive}><a href="#" id="btnNext" onClick={this.btnNextClick}> Next </a></li>;
    }
    return (
      <ul id="page-numbers" className="pagination pagination-event-console">
        {renderPrevBtn}
        {pageDecrementBtn}
        {renderPageNumbers}
        {pageIncrementBtn}
        {renderNextBtn}
      </ul>
    );
  }
}