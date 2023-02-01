// Plugin to handle Citation.
import {Plugin, PluginKey} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema} from 'prosemirror-model';
import VignetteCommand from './VignetteCommand';
import VignetteNodeSpec from './VignetteNodeSpec';
import { TABLE } from './Constants';

export class VignettePlugin extends Plugin {
  _view: EditorView = null;
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
      },
    });
  }

  getEffectiveSchema(schema: Schema): Schema {
    const table = schema.spec.nodes.get(TABLE);
    const vignette = VignetteNodeSpec(table);
    const marks = schema.spec.marks;
    const nodes = schema.spec.nodes.update(TABLE, vignette);

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
