import {Selection, TextSelection} from 'prosemirror-state';

export function isAllowed(selection: Selection) {
  let bOK = false;
  if (selection.constructor.name === TextSelection.name) {
    bOK = selection.from === selection.to;
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
  }
  return bOK;
}
