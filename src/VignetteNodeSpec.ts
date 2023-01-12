import {NodeSpec} from 'prosemirror-model';

const VignetteNodeSpec: NodeSpec = {
  attrs: {
    id: { default: '' },
    class: { default: 'vignette' },
    width: { default: '100px' },
    height: { default: '100px' },
    backgroundColor: { default: 'lightgrey' },
    align: { default: 'left'},
  },
  group: 'inline',
  atom: true,
  selectable: true,
  draggable: true,
  content: 'block*',
  inline: true,///
  parseDOM: [
    {
      tag: 'div.vignette',
      getAttrs(dom: HTMLElement) {
        const { cssFloat, display } = dom.style;
        let align = dom.getAttribute('data-align') || dom.getAttribute('align');
  if (align) {
    align = /(left|right|center)/.test(align) ? align : null;
  } else if (cssFloat === 'left' && !display) {
    align = 'left';
  } else if (cssFloat === 'right' && !display) {
    align = 'right';
  } else if (!cssFloat && display === 'block') {
    align = 'block';
  }
        return {
          id: dom.getAttribute('id'),
          class: dom.getAttribute('class'),
          width: dom.style.width,
          height: dom.style.height,
          backgroundColor: dom.style.backgroundColor,
          align
        };
      },
    },
  ],
  toDOM(node) {
    return ['div', node.attrs, 0];
  },
};

export default VignetteNodeSpec;