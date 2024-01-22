// @flow

import nullthrows from 'nullthrows';
import {EditorState} from 'prosemirror-state';
import {setCellAttr} from 'prosemirror-tables';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';

import {
  ColorEditor,
  atAnchorRight,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';

export class TableColorCommand extends UICommand {
  _popUp = null;

  getAttrName = (): string => {
    return '';
  };

  isEnabled = (_state: EditorState): boolean => {
    return true;
  };

  shouldRespondToUIEvent = (e: React.SyntheticEvent | MouseEvent): boolean => {
    return e.type === UICommand.EventType.MOUSEENTER;
  };

  waitForUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    event?: React.SyntheticEvent
  ): Promise<unknown> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    const target = nullthrows(event).currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }

    const anchor = event ? event.currentTarget : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(ColorEditor, null, {
        anchor,
        position: atAnchorRight,
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
    color?: string
  ): boolean => {
    if (dispatch && color !== undefined) {
      const cmd = setCellAttr(this.getAttrName(), color);
      cmd(state, dispatch, view);
      return true;
    }
    return false;
  };

  cancel(): void {
    this._popUp?.close(undefined);
  }
}
