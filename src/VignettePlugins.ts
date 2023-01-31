import {VignettePlugin} from './VignettePlugin';
import VignetteMenuPlugin from './VignetteMenuPlugin';

// Tables
// https://github.com/ProseMirror/prosemirror-tables/blob/master/demo.js
export default [
  new VignetteMenuPlugin(),
  //new TableResizePlugin(),
  //tableEditing(),
  new VignettePlugin(),
];
