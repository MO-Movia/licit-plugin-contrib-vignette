import {EditorState, Plugin, PluginKey} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Node} from 'prosemirror-model';

/* eslint-disable-next-line */
import * as React from 'react';

import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import TableBackgroundColorCommand from './TableBackgroundColorCommand';
import TableBorderColorCommand from './TableBorderColorCommand';
import createCommand from './CreateCommand';
import {CellSelection, deleteTable} from 'prosemirror-tables';

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

class VignetteTooltipView {
  constructor(editorView: EditorView) {
    editorView['pluginViews'].forEach((pluginView) => {
      if (
        pluginView.constructor &&
        pluginView.constructor.name &&
        'TableCellTooltipView' === pluginView.constructor.name
      ) {
        pluginView['getMenu'] = this.getMenu;
      }
    });
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

// https://prosemirror.net/examples/tooltip/
const SPEC = {
  // [FS] IRAD-1005 2020-07-07
  // Upgrade outdated packages.
  key: new PluginKey('VignetteMenuPlugin'),
  view(editorView: EditorView) {
    return new VignetteTooltipView(editorView);
  },
};

class VignetteMenuPlugin extends Plugin {
  constructor() {
    super(SPEC);
  }
}

export default VignetteMenuPlugin;
