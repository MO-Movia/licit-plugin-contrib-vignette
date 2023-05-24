import {Fragment} from 'prosemirror-model';
import {EditorState, Transaction, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {DEF_BORDER_COLOR, PARAGRAPH, TABLE, TABLE_CELL} from './Constants';

class VignetteCommand extends UICommand {
  isEnabled = (state: EditorState, view?: EditorView): boolean => {
    return this.__isEnabled(state, view);
  };

  execute = (
    state: EditorState,
    dispatch?: (tr: Transaction) => void,
    view?: EditorView
  ): boolean => {
    if (dispatch) {
      let {tr} = state;
      tr = this.insertTable(state, 1, 1);
      dispatch(tr);
      view && view.focus();
    }

    return true;
  };

  __isEnabled = (state: EditorState, _view?: EditorView): boolean => {
    const tr = state;
    let bOK = false;
    const {selection} = tr;
    //if (selection instanceof _prosemirrorState.TextSelection) {
    bOK = selection.from === selection.to;
    // [FS] IRAD-1065 2020-09-18
    // Disable create table menu if the selection is inside a table.
    if (bOK) {
      const $head = selection.$head;
      let vignette = false;
      for (let d = 0; $head.depth > d; d++) {
        const n = $head.node(d);
        if (n.type.name == 'table' && n.attrs['vignette']) {
          vignette = true;
        }
        if (n.type.spec.tableRole == 'row') {
          bOK = !vignette;
        }
      }
    }
    return bOK;
  };

  insertTable(state: EditorState, rows: number, cols: number): Transaction {
    let {tr} = state;
    const {schema} = state;
    if (!tr.selection || !tr.doc) {
      return tr;
    }
    const {from, to} = tr.selection;
    if (from !== to) {
      return tr;
    }

    const {nodes} = schema;
    const cell = nodes[TABLE_CELL];
    const paragraph = nodes[PARAGRAPH];
    const row = nodes['table_row'];
    const table = nodes[TABLE];
    if (!(cell && paragraph && row && table)) {
      return tr;
    }

    const rowNodes = [];
    for (let rr = 0; rr < rows; rr++) {
      const cellNodes = [];
      for (let cc = 0; cc < cols; cc++) {
        // [FS] IRAD-950 2020-05-25
        // Fix:Extra arrow key required for cell navigation using arrow right/Left
        const cellNode = cell.create(
          {
            borderColor: DEF_BORDER_COLOR,
            background: '#dce6f2',
            vignette: true,
          },
          Fragment.fromArray([paragraph.create()])
        );
        cellNodes.push(cellNode);
      }
      const rowNode = row.create({}, Fragment.from(cellNodes));
      rowNodes.push(rowNode);
    }
    const tableNode = table.create({vignette: true}, Fragment.from(rowNodes));
    tr = tr.insert(from, Fragment.from(tableNode));

    const selection = TextSelection.create(tr.doc, from + 5, from + 5);

    tr = tr.setSelection(selection);

    tr = this.insertParagraph(state, tr, from, to);
    return tr;
  }

  // [FS] 2021-04-01
  // Add empty line after table drop
  // To make easier to enter a line after table
  insertParagraph(
    state: EditorState,
    tr: Transaction,
    from: number,
    to: number
  ) {
    const paragraph = state.schema.nodes[PARAGRAPH];
    const textNode = state.schema.text(' ');
    if (from !== to) {
      return tr;
    }
    const paragraphNode = paragraph.create({}, textNode, null);
    tr = tr.insert(from + 7, Fragment.from(paragraphNode));
    return tr;
  }
}

export default VignetteCommand;
