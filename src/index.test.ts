import {createEditor, doc, p, table, tr, td} from 'jest-prosemirror';
import VignetteCommand from './VignetteCommand';
import VignettePlugins from './VignettePlugins';

export {};

describe('VignettePlugin', () => {
  it('should handle VignetteCommand', () => {
    createEditor(doc(p('<cursor>')), {plugins: [...VignettePlugins]})
      .command((state, dispatch) => {
        if (dispatch) {
          new VignetteCommand().execute(state, dispatch);
        }
        return true;
      })
      .callback((content) => {
        expect(content.state.doc).toEqualProsemirrorNode(
          doc(
            p(),
            table(
              tr(
                td(
                  {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    pretty: true,
                    ugly: false,
                  },
                  p()
                )
              )
            ),
            p(' ')
          )
        );
      });
  });
});
