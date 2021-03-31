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
import './UserFeedback.less';
import { getUserReaction, postReaction, updateReaction, getAllReactions } from '../../api_calls';
import $ from 'jquery';
import { produce } from 'immer';
import moment from 'moment';

export class UserFeedback extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userReactionData: {},
      additionalComments: '',
      reaction: '',
      dislikeComments: [],
      allReactions: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  //this method is used to fetch the data making the necessary API calls
  //which will be displayed under the UserFeedback component.
  fetchData = () => {
    getUserReaction(this.props.alertId)
      .then((data) => {
        if(data.user_reaction === 'Like') {
          $('.like-button').addClass('selected-reaction');
        }else if(data.user_reaction === 'Dislike') {
          $('.dislike-button').addClass('selected-reaction');
        }else {
          $('.like-button').removeClass('selected-reaction');
          $('.dislike-button').removeClass('selected-reaction');
        }

        //additonal_comment received from backend has both additonal comment and comments that are displyed
        //under dislike reaction.
        let dislikeComments = data.additional_comment;
        // eslint-disable-next-line prefer-const
        let dislikeCommentsExamples = [
          'This alert is not relevant to me.',
          'This alert is not important.',
          'The information in the alert is not accurate.'
        ];

        //we do the below filter operation to find out whether additonal_comments received from backend
        //has comments displayed under 'dislike' reaction. If they are present, then we put it under
        //dislikeComments and the rest under additionalComments.
        dislikeComments = dislikeComments.filter(val => dislikeCommentsExamples.includes(val));
        let additionalComments = data.additional_comment.filter(val => !dislikeCommentsExamples.includes(val));
        additionalComments = additionalComments.toString();
        getAllReactions(this.props.alertId)
          .then((allReactions) => {
            this.setState({
              userReactionData: data,
              reaction: data.user_reaction,
              dislikeComments,
              allReactions: allReactions.comments,
              additionalComments: additionalComments
            });
          });
      });
  }

  //this method is called when the additional comment text-area changes.
  handleAdditonalComment = (e) => {
    const additionalComments = e.target.value;
    this.setState({ additionalComments: additionalComments });
  }

  //this method is called when the user clicks on either 'Accept' or 'Reject' actions.
  handleReaction = (reaction) => {
    if(reaction === 'Like') {
      $('.like-button').addClass('selected-reaction');
      $('.dislike-button').removeClass('selected-reaction');
    }else if(reaction === 'Dislike') {
      $('.dislike-button').addClass('selected-reaction');
      $('.like-button').removeClass('selected-reaction');
    }
    this.setState({ reaction: reaction });
  }

  //this method is called when the user clicks on the submit button.
  handleSubmit = () => {
    const comments = this.state.userReactionData.user_reaction === 'Dislike' ? this.state.dislikeComments : [];
    if(this.state.additionalComments !== '') {
      comments.push(this.state.additionalComments);
    }

    //if there is no reaction then there is no database entry of reaction for this event by this user
    //so we make a 'Post' API call to post a reaction.
    if(this.state.userReactionData.user_reaction === 'No Reaction') {
      postReaction(this.props.alertId, this.state.reaction, comments)
        .then(() => this.fetchData());
    }
    //if there is a reaction then there is a database entry of reaction for this event by this user
    //so we make a 'PUT' API call to alter the already present reaction.
    else {
      updateReaction(this.props.alertId, this.state.reaction, comments)
        .then(() => this.fetchData());
    }
    this.props.addOrRemoveReaction(this.state.reaction);
  }

  //this method is called when the user selects the 'reject' response and clicks on any checkboxes
  //under it.
  onChecked = (dislikeComment) => {
    const index = this.state.dislikeComments.indexOf(dislikeComment);
    let dislikeComments = this.state.dislikeComments;
    if(index > -1) {
      dislikeComments = produce(this.state.dislikeComments, (draft) => {
        draft.splice(index, 1);
      });
    }else {
      dislikeComments.push(dislikeComment);
    }

    this.setState({ dislikeComments });
  }

  //this method is called when the user clicks on 'rect; reaction and we have to display the
  //checkboxes with labels of reject reaction.
  displayDislikeComments = () => {

    return(
      <div className="dislike-options">
        <div>
          <label className="dislike-options-label">
            <input
              className="not-relavant"
              type="checkbox"
              onClick={() => this.onChecked('This alert is not relevant to me.')}
              checked={this.state.dislikeComments.indexOf('This alert is not relevant to me.') > -1}
            />
            <span className="checkbox-label">This alert is not relevant to me.</span>
          </label>
        </div>
        <div>
          <label className="dislike-options-label">
            <input
              className="not-important"
              type="checkbox"
              onClick={() => this.onChecked('This alert is not important.')}
              checked={this.state.dislikeComments.indexOf('This alert is not important.') > -1}
            />
            <span className="checkbox-label">This alert is not important.</span>
          </label>
        </div>
        <div>
          <label className="dislike-options-label">
            <input
              className="not-accurate"
              type="checkbox"
              onClick={() => this.onChecked('The information in the alert is not accurate.')}
              checked={this.state.dislikeComments.indexOf('The information in the alert is not accurate.') > -1}
            />
            <span className="checkbox-label">The information in the alert is not accurate.</span>
          </label>
        </div>
      </div>
    );

  }

  //this method is called when the user clicks on the cancel button.
  handleCancel = () => {
    if(this.state.reaction !== 'No Reaction') {
      updateReaction(this.props.alertId, 'No Reaction', [])
        .then(() => this.fetchData());
    }else {
      this.setState({ reaction: 'No Reaction',  additionalComments: '' });
    }

    this.props.addOrRemoveReaction('No Reaction');
  }

  //this method is called to render the user feedback if there is any.
  renderUserFeedback = () => {
    return(
      this.state.allReactions && this.state.allReactions.map((reaction) => {
        if(reaction.user_reaction === 'Like') {
          return (
            <div className="like-reaction-details">
              <div className="like-icon-div">
                <i className="fa fa-3x fa-thumbs-o-up like-icon" />
              </div>
              <div className="like-comments">
                {reaction.additional_comment.map((comment) => {
                  return(<div>{comment}</div>);
                })}
                <div className="like-user-details">
                  <div
                    className="user-detail-name"
                  >
                    {reaction.username}
                  </div>
                  <div>{moment(reaction.time_added).fromNow()}</div>
                </div>
              </div>
            </div>
          );
        }else if(reaction.user_reaction === 'Dislike') {
          return (
            <div className="dislike-reaction-details">
              <div className="dislike-icon-div">
                <i className="fa fa-3x fa-thumbs-o-down dislike-icon" />
              </div>
              <div className="like-comments">
                {reaction.additional_comment.map((comment) => {
                  return(<div>{comment}</div>);
                })}
                <div className="dislike-user-details">
                  <div
                    className="user-detail-name"
                  >{reaction.username}
                  </div>
                  <div>{moment(reaction.time_added).fromNow()}</div>
                </div>
              </div>
            </div>
          );
        }
      })
    );
  }

  render() {

    return(
      <div className="user-feedback-container">
        <div className="user-feedback-wrapper">
          <div className="feedback-question">How would you rate this alert?</div>
          <div className="reactions-div">
            <div className="like-wrapper">
              <div
                className="like-button-div"
                onClick={() => this.handleReaction('Like')}
              >
                <i className="fa fa-3x fa-thumbs-o-up like-button" />
              </div>
              <div>Accept</div>
            </div>
            <div className="dislike-wrapper">
              <div
                className="dislike-button-div"
                onClick={() => this.handleReaction('Dislike')}
              >
                <i className="fa fa-3x fa-thumbs-o-down dislike-button" />
              </div>
              <div>Reject</div>
            </div>
          </div>
          {this.state.reaction === 'Dislike' && this.displayDislikeComments()}
          <div
            className="additonal-feedback-section"
          >
             Do you have any additional feedback?
          </div>
          <textarea
            className="additonal-comment-textarea"
            rows="3"
            placeholder="Additional Comments..."
            value={this.state.additionalComments}
            onChange={event => this.handleAdditonalComment(event)}
          />
          <div className="actions-div">
            <button
              className="cancel-button button-left"
              onClick={() => this.handleCancel()}
            >
            Cancel
            </button>
            <button
              className="submit-button"
              onClick={() => this.handleSubmit()}
            >
            Submit
            </button>
          </div>
        </div>
        <div className="overall-feedback">
          <div className="overall-feedback-header">Overall User Feedback</div>
          {this.state.allReactions.length > 0 ? this.renderUserFeedback()
            : <div className="no-user-feedback">No User feedback received yet.</div>}
        </div>
      </div>
    );
  }
}