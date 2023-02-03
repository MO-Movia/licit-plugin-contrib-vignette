import {EditorState, Plugin, PluginKey} from 'prosemirror-state';
import {EditorView, Decoration, DecorationSet} from 'prosemirror-view';
import {Node} from 'prosemirror-model';

import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import TableBackgroundColorCommand from './TableBackgroundColorCommand';
import TableBorderColorCommand from './TableBorderColorCommand';
import createCommand from './CreateCommand';
import {CellSelection, deleteTable, TableView} from 'prosemirror-tables';
import {TABLE} from './Constants';

export const TABLE_BACKGROUND_COLOR = new TableBackgroundColorCommand();
export const TABLE_BORDER_COLOR = new TableBorderColorCommand();
export const TABLE_DELETE_TABLE = createCommand(deleteTable);

export const VIGNETTE_COMMANDS_GROUP = [
  {
    'Fill Color...': TABLE_BACKGROUND_COLOR,
    'Border Color....': TABLE_BORDER_COLOR,
  },
  {
    'Delete Vignette': TABLE_DELETE_TABLE,
  },
];

class VignetteView {
  constructor(editorView: EditorView) {
    this.setCustomMenu(editorView);
    this.setCustomTableNodeViewUpdate(editorView);
  }

  setCustomMenu(editorView: EditorView) {
    editorView['pluginViews'].forEach((pluginView) => {
      if (
        // 'TableCellTooltipView' has property _cellElement
        Object.prototype.hasOwnProperty.call(pluginView, '_cellElement')
      ) {
        pluginView['getMenu'] = this.getMenu;
      }
    });
  }

  setCustomTableNodeViewUpdate(editorView: EditorView) {
    const tableNodeView = editorView['nodeViews']['table'];
    const tableNodeViewEx = this.tableNodeViewEx.bind(this, tableNodeView);
    editorView['nodeViews'][TABLE] = tableNodeViewEx;
    const index = editorView.state.plugins.findIndex((plugin) => {
      return plugin.spec.key['key'].includes('tableColumnResizing$');
    });
    editorView.state.plugins[index].spec.props.nodeViews[TABLE] =
      tableNodeViewEx;
  }

  tableNodeViewEx(
    tableNodeView: (node: Node, view: EditorView) => TableView,
    node: Node,
    view: EditorView
  ): TableView {
    const base = tableNodeView(node, view);
    if (base && base.update && node.attrs.vignette) {
      base.update = this.updateEx.bind(base, base.update, this);
      this.updateBorder(base);
    }
    return base;
  }

  updateEx(
    update: (node: Node) => boolean,
    self: VignetteView,
    node: Node
  ): boolean {
    const result = update.call(this, node);
    if (result) {
      self.updateBorder(this as unknown as TableView);
    }
    return result;
  }

  updateBorder(tableView: TableView) {
    tableView.table.style.border = 'none';
  }

  getMenu(
    _state: EditorState,
    actionNode: Node
  ): Array<{[key: string]: UICommand}> {
    let vignette = false;
    if (_state.selection instanceof CellSelection) {
      if (_state.selection.$anchorCell.node(-1).attrs.vignette) {
        vignette = true;
      }
    }
    if (actionNode && actionNode.attrs.vignette) {
      vignette = true;
    }
    if (_state.selection.$anchor.node(1).attrs.vignette) {
      vignette = true;
    }
    return vignette ? VIGNETTE_COMMANDS_GROUP : null;
  }

  destroy = (): void => {
    // do nothing.
  };
}

const SPEC = {
  key: new PluginKey('VignetteMenuPlugin'),
  view(editorView: EditorView) {
    return new VignetteView(editorView);
  },
};

class VignetteMenuPlugin extends Plugin {
  constructor() {
    super(SPEC);
  }
}

export default VignetteMenuPlugin;
