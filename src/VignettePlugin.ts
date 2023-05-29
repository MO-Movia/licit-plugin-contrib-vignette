// Plugin to handle Citation.
import {Plugin, PluginKey} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema, Slice} from 'prosemirror-model';
import VignetteCommand from './VignetteCommand';
import {
  VignetteTableCellNodeSpec,
  VignetteTableNodeSpec,
} from './VignetteNodeSpec';
import {TABLE, TABLE_CELL} from './Constants';
import {isAllowed} from './Helper';

export class VignettePlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('VignettePlugin'),
      state: {
        init(_config, _state) {
          // do nothing
        },
        apply(_tr, _set) {
          //do nothing
        },
      },
      props: {
        nodeViews: {},
        handlePaste(
          view: EditorView,
          _event: ClipboardEvent,
          slice: Slice
        ): boolean | void {
          // check if copied content have table.
          let allowed = true;
          let haveTable = false;
          for (let i = 0; i < slice.content.childCount; i++) {
            if ('table' == slice.content.child(i).type.name) {
              haveTable = true;
            }
          }

          if (haveTable) {
            allowed = isAllowed(view.state.selection);
          }
          return !allowed;
        },
      },
    });
  }

  getEffectiveSchema(schema: Schema): Schema {
    let nodes = schema.spec.nodes.update(
      TABLE,
      VignetteTableNodeSpec(schema.spec.nodes.get(TABLE))
    );
    nodes = nodes.update(
      TABLE_CELL,
      VignetteTableCellNodeSpec(schema.spec.nodes.get(TABLE_CELL))
    );
    const marks = schema.spec.marks;

    return new Schema({
      nodes: nodes,
      marks: marks,
    });
  }

  initButtonCommands() {
    return {
      '[crop] Insert Vignette': new VignetteCommand(),
    };
  }
}
