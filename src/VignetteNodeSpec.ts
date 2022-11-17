import {NodeSpec} from 'prosemirror-model';

const VignetteNodeSpec: NodeSpec = {
  content: 'text*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,
  isolating: true,
  parseDOM: [{tag: 'pre', preserveWhitespace: 'full'}],
  toDOM() {
    return ['pre', ['vignette', 0]];
  },
};

export default VignetteNodeSpec;