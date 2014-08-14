/**
 * ELASTICSEARCH CONFIDENTIAL
 * _____________________________
 *
 *  [2014] Elasticsearch Incorporated All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Elasticsearch Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Elasticsearch Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Elasticsearch Incorporated.
 */



/* jshint -W101 */
define([ 'ace'], function (ace) {
  "use strict";
  ace.define("ace/theme/sense-dark", ['require', 'exports', 'module'],
    function (require, exports, module) {
      exports.isDark = true;
      exports.cssClass = "ace-sense-dark";
      exports.cssText = ".ace-sense-dark .ace_gutter {\
background: #2e3236;\
color: #bbbfc2;\
}\
.ace-sense-dark .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-sense-dark .ace_scroller {\
background-color: #202328;\
}\
.ace-sense-dark .ace_content {\
}\
.ace-sense-dark .ace_text-layer {\
color: #F8F8F2\
}\
.ace-sense-dark .ace_cursor {\
border-left: 2px solid #F8F8F0\
}\
.ace-sense-dark .ace_overwrite-cursors .ace_cursor {\
border-left: 0px;\
border-bottom: 1px solid #F8F8F0\
}\
.ace-sense-dark .ace_marker-layer .ace_selection {\
background: #222\
}\
.ace-sense-dark.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
border-radius: 2px\
}\
.ace-sense-dark .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-sense-dark .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-sense-dark .ace_marker-layer .ace_active-line {\
background: #202020\
}\
.ace-sense-dark .ace_gutter-active-line {\
background-color: #272727\
}\
.ace-sense-dark .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-sense-dark .ace_invisible {\
color: #49483E\
}\
.ace-sense-dark .ace_entity.ace_name.ace_tag,\
.ace-sense-dark .ace_keyword,\
.ace-sense-dark .ace_meta,\
.ace-sense-dark .ace_storage {\
color: #F92672\
}\
.ace-sense-dark .ace_constant.ace_character,\
.ace-sense-dark .ace_constant.ace_language,\
.ace-sense-dark .ace_constant.ace_numeric,\
.ace-sense-dark .ace_constant.ace_other {\
color: #AE81FF\
}\
.ace-sense-dark .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-sense-dark .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-sense-dark .ace_support.ace_constant,\
.ace-sense-dark .ace_support.ace_function {\
color: #66D9EF\
}\
.ace-sense-dark .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-sense-dark .ace_storage.ace_type,\
.ace-sense-dark .ace_support.ace_class,\
.ace-sense-dark .ace_support.ace_type {\
font-style: italic;\
color: #66D9EF\
}\
.ace-sense-dark .ace_entity.ace_name.ace_function,\
.ace-sense-dark .ace_entity.ace_other.ace_attribute-name,\
.ace-sense-dark .ace_variable {\
color: #A6E22E\
}\
.ace-sense-dark .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-sense-dark .ace_string {\
color: #E6DB74\
}\
.ace-sense-dark .ace_comment {\
color: #629755\
}\
.ace-sense-dark .ace_markup.ace_underline {\
text-decoration: underline\
}\
.ace-sense-dark .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNQ11D6z7Bq1ar/ABCKBG6g04U2AAAAAElFTkSuQmCC) right repeat-y\
}";

      var dom = require("ace/lib/dom");
      dom.importCssString(exports.cssText, exports.cssClass);
    })
});
