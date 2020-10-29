
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
import PropTypes from 'prop-types';
import './_vunet_help.less';
import { htmlIdGenerator } from 'ui_framework/services';

// This component provides a help block. In the help block description we support multi-level bullets.
// For advanced formatting, html attributes can be provided as a part of the string for the bullet description.
// For more information see sample structure below

// props:
// backgroundColor: PropTypes.string, // (optional) if backgroundColor is 'white', a white background is provided or else grey background provided
// metaData: PropTypes.array[PropTypes.object] // Call back function to be called on toggle

// metaData object structure
// headerText: PropTypes.string,
// referenceLink: PropTypes.string,
// contentList: PropTypes.object,

// contentList object structure
// title: PropTypes.string
// description: PropTypes.string
// nestedContent: PropTypes.array[PropTypes.object]

// metaData structure example
// {
//   headerText: 'this is just a title',
//   referenceLink: 'documentation/moreInfo',
//   contentIntroduction : 'brief intoduction of the contents'
//   contentList: [
//     {
//       title: 'title 1',
//       description: 'title 1 description' +
//         '\n </b><u><i> Example: </i></u></b>' +
//         '\n Example line 1' +
//         '\n Example line 2'
//     },
//     {
//       title: 'title 2',
//       nestedContent: [
//         {
//           title: 'title 2.1',
//           description: 'title 2.1 description'
//         },
//         {
//           title: 'title 2.2',
//           nestedContent: [
//             {
//               title: 'title 2.2.1',
//               description: 'title 2.2.1 description'
//             }
//           ]
//         },
//       ]
//     },
//     {
//       description: 'title 3 (without bold)'
//       nestedContent: [{
//         title: 'title 3.1',
//         description: 'title 3.1 description description'
//       }]
//     },
//   ]
// }
// NOTE: Notice that in 'title 1 description', html attributes can be provided as a part of the string for the bullet description
// NOTE: If you don't want title in bold, use decription instead of title. look at title 3 in example above

export function VunetHelp(props) {
  // This method generates the list of bullet items.
  // It is a self recursive function to support the multi-level bullets feature.
  const generateBody = (contentList) => {

    // html items will be dynamically push into these arrays
    // overall un-ordered list array
    const unOrderedList = [];

    // overall list item array
    const listItem = [];

    // temporary array for inner items
    let innerItemList = [];

    // used to generate random ids
    const idGenerator = htmlIdGenerator();

    // returns the inner item
    // if value is an array we perform a recursion
    const getInnerItem = (dataObject, key, value) => {
      // if
      // 1) key is 'nestedContent'
      // 2) object's value is of type array of object,
      // We need to perform a recursion.
      if (key === 'nestedContent' && Array.isArray(value)) {
        return generateBody(value);
      }
      // if object's value is of type string,
      // We need to return a div with the value.
      else {
        return (
          <div
            className={(key === 'title' ? 'titleText' : 'bodyText')}
            // if
            // 1) key is 'description'
            // 2) 'title' is not present
            // use an inLine style to make description as title
            style={
              (key === 'description' && !dataObject.title ?
                { display: 'inline-block', fontSize: '1.6rem' } : null)
            }
            key={idGenerator()}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        );
      }
    };

    if (contentList) {
      contentList.forEach((dataObject) => {
        innerItemList = [];

        // populate innerItem for title
        if (dataObject.title) {
          innerItemList.push(
            getInnerItem(dataObject, 'title', dataObject.title)
          );
        }

        // populate innerItem for description
        if (dataObject.description) {
          innerItemList.push(
            getInnerItem(dataObject, 'description', dataObject.description)
          );
        }

        // populate innerItem for nestedContent
        if (dataObject.nestedContent) {
          innerItemList.push(
            getInnerItem(dataObject, 'nestedContent', dataObject.nestedContent)
          );
        }

        // push the innerItemList into list-item
        listItem.push(
          <li key={idGenerator()}>
            {innerItemList}
          </li>
        );
      });
    }


    // finally after we obtain all listItems, push all the listItems inside unOrderedList
    unOrderedList.push(
      <ul key={idGenerator()}>
        {listItem}
      </ul>
    );
    return unOrderedList;
  };

  const {
    metaData,
    backgroundColor,
    onClose
  } = props;

  return (
    <div
      className={'vunet-help-container ' + (backgroundColor === 'white' ? 'vunet-help-container-white' : 'vunet-help-container-grey')}
    >
      {/* Header */}
      <div className="help-header">
        <span className="help-icon icon-help-heading" />
        <span className="header-text">{metaData.headerText}</span>
        <div className="spacer" />

        {/* add referenceLink if its present in props */}
        {metaData.referenceLink &&
          <div className="more-info-container">
            <span className="reference-link-pre-text">
              For more information about data,
            </span>
            <a
              className="reference-link-text"
              target="_blank"
              href={metaData.referenceLink}
            >
              please direct to the document.
            </a>

            <a
              href={metaData.referenceLink}
              target="_blank"
            >
              <i className="external-link-icon icon-redirect" />
            </a>
          </div>
        }

        <i
          className="close-icon icon-Close-01"
          onClick={onClose}
        />
      </div>

      {/* Body */}
      <div className="help-body">

        {/* content introduction */}
        {metaData.contentIntroduction &&
          <div
            className="content-introduction"
            dangerouslySetInnerHTML={{ __html: metaData.contentIntroduction }}
          />
        }

        {/* content body */}
        {
          generateBody(metaData.contentList)
        }

        {/* content addition custom content (optional) */}
        {metaData.additionalContent &&
          (
            <div
              className="content-additional-info"
              dangerouslySetInnerHTML={{ __html: metaData.additionalContent }}
            />
          )
        }
      </div>
    </div>
  );
}

// meta data for the component
VunetHelp.propTypes = {
  backgroundColor: PropTypes.string, // (optional) if backgroundColor is 'white', a white background is provided or else grey background provided
  metaData: PropTypes.shape({ // meta data for the component
    headerText: PropTypes.string.isRequired, // help block title
    referenceLink: PropTypes.string, // (optional) additional information reference link
    additionalContent: PropTypes.string, // (optional) additional custom content. Added at the end
    contentList: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string, // (optional) list item title
        description: PropTypes.string, // (optional) list item description
        nestedContent: PropTypes.array // (optional) list item containing another contentList
      })
    ),
  }),
  onClose: PropTypes.func // callback method which gets called when help component is closed
};