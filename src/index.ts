// Plugin to handle Citation.
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node, Schema } from 'prosemirror-model';
import OrderedMap from 'orderedmap';
import VignetteNodeSpec from './VignetteNodeSpec';
import { VIGNETTE } from './Constants';
import VignetteCommand from './VignetteCommand';
import * as React from 'react';
import VignetteView from './ui/VignetteView';
import { EditorFocused } from './ui/CustomNodeView';

// singleton instance of VignettePlugin
let siVignettePlugin: VignettePlugin;

export class VignettePlugin extends Plugin {
  _view: EditorView = null;
  constructor(licit: typeof React.Component) {
    super({
      key: new PluginKey('VignettePlugin'),
      state: {
        init(_config, _state) {
          siVignettePlugin.spec.props.nodeViews[VIGNETTE] =
            bindVignetteView.bind(this, licit);
        },
        apply(_tr, _set) {
          //do nothing
        },
      },
      props: {
        nodeViews: {},
      },
    });
    if (siVignettePlugin) {
      return siVignettePlugin;
    }
    siVignettePlugin = this as VignettePlugin;
  }

  getEffectiveSchema(schema: Schema): Schema {
    const nodes = (schema.spec.nodes as OrderedMap).append({
      vignette: VignetteNodeSpec,
    });
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

export function bindVignetteView(
  _licit: typeof React.Component,
  node: Node,
  view: EditorView,
  curPos: () => number
): VignetteView {
  return new VignetteView(node, view as EditorFocused, curPos, undefined);
}
