import {createEditor, doc, p, table, tr, td} from 'jest-prosemirror';
import {TABLE} from './Constants';
import VignetteCommand from './VignetteCommand';
import {VignettePlugin} from './VignettePlugin';
import VignettePlugins from './VignettePlugins';
import createCommand from './CreateCommand';
import {deleteTable} from 'prosemirror-tables';

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

  it('should handle getEffectiveSchema', () => {
    const schema = createEditor(doc(p('<cursor>'))).schema;
    expect(schema.spec.nodes.get(TABLE)?.attrs?.vignette).toBeFalsy();
    const newSchema = new VignettePlugin().getEffectiveSchema(schema);
    expect(newSchema.spec.nodes.get(TABLE)?.attrs?.vignette).toBeTruthy();
  });

  it('should handle createCommand', () => {
    createEditor(doc(p('<cursor>')), {plugins: [...VignettePlugins]}).command(
      (state, _dispatch) => {
        createCommand(deleteTable).isEnabled(state);
        return true;
      }
    );
  });
});
