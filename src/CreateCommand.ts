import { EditorState, Transaction } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

type ExecuteCall = (
  state: EditorState,
  dispatch?: (tr: Transform) => void,
  view?: EditorView
) => boolean;

export function createCommand(execute: ExecuteCall): UICommand {
  class CustomCommand extends UICommand {
    isEnabled = (state: EditorState): boolean => {
      return this.execute(state);
    };

    execute = (
      state: EditorState,
      dispatch?: (tr: Transform) => void,
      view?: EditorView
    ): boolean => {
      const tr = state.tr;
      let endTr = tr;
      execute(
        state,
        (nextTr) => {
          endTr = nextTr as Transaction;
          dispatch && dispatch(endTr);
        },
        view
      );
      return endTr.docChanged || tr !== endTr;
    };
  }
  return new CustomCommand();
}
