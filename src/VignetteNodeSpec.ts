import {Node, NodeSpec} from 'prosemirror-model';
import {TABLE, VIGNETTE} from './Constants';

// Override the default table node spec to support custom attributes.
export const VignetteTableNodeSpec = (nodespec: NodeSpec) =>
  Object.assign({}, nodespec, {
    attrs: {
      marginLeft: {default: null},
      vignette: {default: false},
    },
    parseDOM: [
      {
        tag: TABLE,
        getAttrs(dom: HTMLElement): unknown | null {
          const {marginLeft} = dom.style;
          const vignette = dom.getAttribute(VIGNETTE) || false;
          if (marginLeft && /\d+px/.test(marginLeft)) {
            return {marginLeft: parseFloat(marginLeft), vignette};
          }
          return {vignette};
        },
      },
    ],
    toDOM(node: Node): Array<unknown> {
      // Normally, the DOM structure of the table node is rendered by
      // `TableNodeView`. This method is only called when user selects a
      // table node and copies it, which triggers the "serialize to HTML" flow
      //  that calles this method.
      const {marginLeft, vignette} = node.attrs;
      const domAttrs = {vignette};
      let style = 'border: none';
      if (marginLeft) {
        style += `margin-left: ${marginLeft}px`;
      }
      domAttrs['style'] = style;
      return [TABLE, domAttrs, 0];
    },
  });

export const VignetteTableCellNodeSpec = (nodespec: NodeSpec) =>
  Object.assign({}, nodespec, {
    attrs: Object.assign({}, nodespec.attrs, {
      vignette: {default: false},
    }),
    toDOM(node: Node): Array<unknown> {
      const base = nodespec.toDOM(node);
      if (
        node.attrs.vignette &&
        Array.isArray(base) &&
        1 < base.length &&
        base[1].style
      ) {
        base[1].style += 'border-radius: 10px; border-style: solid; border-width: thin';
      }

      return base as unknown as Array<unknown>;
    },
  });

export default VignetteTableNodeSpec;
