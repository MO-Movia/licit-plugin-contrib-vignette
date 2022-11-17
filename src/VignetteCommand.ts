import {Fragment, Schema} from 'prosemirror-model';
import {EditorState, Transaction, TextSelection} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {createPopUp} from '@modusoperandi/licit-ui-commands';
import VignetteEditor, {VignetteEditorState} from './ui/VignetteEditor';
import {VIGNETTE} from './Constants';

export function insertVignette(
  tr: Transform,
  schema: Schema,
  config?: VignetteEditorState
): Transform {
  const {selection} = tr as Transaction;
  if (!selection) {
    return tr;
  }
  const {from, to} = selection;
  if (from !== to) {
    return tr;
  }

  const vignette = schema.nodes[VIGNETTE];
  if (!vignette) {
    return tr;
  }

  const attrs = {
    width: config.width,
    height: config.height,
  };

  const node = vignette.create(attrs, null, null);
  const frag = Fragment.from(node);
  tr = tr.insert(from, frag);
  return tr;
}

class VignetteCommand extends UICommand {
  _popUp = null;

  getEditor(): typeof React.Component {
    return VignetteEditor;
  }

  isEnabled = (state: EditorState, view?: EditorView): boolean => {
    return this.__isEnabled(state, view);
  };

  waitForUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<unknown> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }

    return new Promise((resolve) => {
      const props = {runtime: view['runtime']};
      this._popUp = createPopUp(this.getEditor(), props, {
        modal: true,
        onClose: (val) => {
          if (this._popUp) {
            this._popUp = null;
            resolve(val);
          }
        },
      });
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    view?: EditorView,
    config?: VignetteEditorState
  ): boolean => {
    if (dispatch) {
      const {selection, schema} = state;
      let {tr} = state;
      tr = tr.setSelection(selection);
      if (config) {
        tr = insertVignette(tr, schema, config) as Transaction;
      }
      dispatch(tr);
      view && view.focus();
    }

    return false;
  };

  __isEnabled = (state: EditorState, _view?: EditorView): boolean => {
    const tr = state;
    const {selection} = tr;
    if (selection instanceof TextSelection) {
      return selection.from === selection.to;
    }
    return false;
  };
}

export default VignetteCommand;
