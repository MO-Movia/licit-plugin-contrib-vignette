import { createEditor, doc, p, table, tr, td, schema, strong } from 'jest-prosemirror';
import { EditorState, PluginKey, TextSelection } from 'prosemirror-state';
import { TABLE } from './Constants';
import VignetteCommand from './VignetteCommand';
import { VignettePlugin } from './VignettePlugin';
import { VignettePlugins } from './index';
import createCommand from './CreateCommand';
import TableBackgroundColorCommand from './TableBackgroundColorCommand';
import TableBorderColorCommand from './TableBorderColorCommand';
import { VignetteTableCellNodeSpec, VignetteTableNodeSpec } from './VignetteNodeSpec';
import { Node, NodeSpec, Fragment } from 'prosemirror-model';
import VignetteMenuPlugin from './VignetteMenuPlugin';
import { deleteTable } from 'prosemirror-tables';
import { EditorView } from 'prosemirror-view';
import { Transform } from 'prosemirror-transform';
export { };

describe('VignettePlugin', () => {

  const editor = createEditor(doc(p('<cursor>')), { plugins: [...VignettePlugins] });
  const state: EditorState = EditorState.create({
    schema: schema,
    selection: editor.selection,
    plugins: [new VignetteMenuPlugin()]

  });

  const directeditorprops = { state, focus }
  const dom = document.createElement('div')

  const view = new EditorView(dom, directeditorprops);

  it('should handle VignetteCommand', () => {
    createEditor(doc(p('<cursor>')), { plugins: [...VignettePlugins] })
      .command((state, dispatch) => {
        if (dispatch) {
          new VignetteCommand().execute(state, dispatch, view);
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
    const vignetteplugin = new VignettePlugin()
    vignetteplugin.initButtonCommands()
    expect(newSchema.spec.nodes.get(TABLE)?.attrs?.vignette).toBeTruthy();


  });

  it('should handle createCommand', () => {
    const editor = createEditor(doc(p('<cursor>')), {});
    const dom = document.createElement('div')
    const state: EditorState = EditorState.create({
      schema: schema,
      selection: editor.selection,
    });

    const directeditorprops = { state }

    const view = new EditorView(dom, directeditorprops);
    const selection = TextSelection.create(editor.view.state.doc, 0, 0);
    const tr = editor.view.state.tr.setSelection(selection);
    createEditor(doc(p('<cursor>')), { plugins: [...VignettePlugins] }).command(
      (state, _dispatch) => {
        createCommand(deleteTable).isEnabled(state);
        createCommand(deleteTable).execute(state, editor.view.dispatch as (tr: Transform) => void, view)
        return true;
      }
    );
  });

  it('should return borderColor', () => {
    const tablebrdercolorcommand = new TableBorderColorCommand()
    expect(tablebrdercolorcommand.getAttrName()).toEqual('borderColor');
  });
  it('should handle createCommand', () => {
    const tablebgcolorcommand = new TableBackgroundColorCommand()
    expect(tablebgcolorcommand.getAttrName()).toEqual('background');
  });

  it('should return vignette view', () => {
    const editor1 = createEditor(doc(p('<cursor>')))
    const state: EditorState = EditorState.create({
      schema: schema,
      selection: editor1.selection,
    });
    const directeditorprops = { state }
    const dom = document.createElement('div')

    const view = new EditorView(dom, directeditorprops);

    const spec = {
      key: new PluginKey('VignetteMenuPlugin'), view(editorView: EditorView) {
        return view;
      }
    }

    const editor = createEditor(doc(p('<cursor>')), {
      plugins: [new VignetteMenuPlugin()],

    })
    let a = new VignetteMenuPlugin();

  });


  it('dom should have matching node attributes VignetteTableNodeSpec', () => {

    const dom = document.createElement('div');
    dom.setAttribute('style', 'margin-left: 10px');

    const schema = createEditor(doc(p('<cursor>'))).schema;
    const newSchema = new VignettePlugin().getEffectiveSchema(schema);
    const node = newSchema.nodes.table.create({ marginLeft: '10', vignette: 'true' }, Fragment.empty)
    let nodeSpec1: NodeSpec = {
      toDOM: (node: any) => {
        node.attrs.marginLeft = '10px';
        return ['test', { vignette: 'false', marginLeft: '10x' }]
      }
      ,
      parseDOM: [{
        getAttrs: (dom: string | HTMLElement) => {
          (dom as HTMLElement).setAttribute('style', 'margin-left: 10px');
          return { marginLeft: '10px', vignette: 'true' }
        }
      }]

    }


    VignetteTableNodeSpec(nodeSpec1).parseDOM[0].getAttrs(dom);
    expect(VignetteTableNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([

      "table",
      {
        "style": "border: nonemargin-left: 10px",
        "vignette": "true",
      },
      0,
    ])
    expect(VignetteTableNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([
      "table",
      {
        "style": "border: nonemargin-left: 10px",
        "vignette": "true",
      },
      0,
    ])
  })


  it('dom should have matching node attributes VignetteTableNodeSpec if statement coverage', () => {

    const dom = document.createElement('div');
    const node = p('bold');
    let nodeSpec1: NodeSpec = {
      toDOM: (node: Node) => ['test', { vignette: 'false', marginLeft: '10px' }], parseDOM: [{
        getAttrs: (dom: string | HTMLElement) => {
          return { marginLeft: '10px', vignette: 'true' }
        },
      }],
    };

    VignetteTableNodeSpec(nodeSpec1).parseDOM[0].getAttrs(dom);
    expect(VignetteTableNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([

      "table",
      {
        "style": "border: none",
        "vignette": undefined,
      },
      0,
    ]);
    expect(VignetteTableNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([

      "table",
      {
        "style": "border: none",
        "vignette": undefined,
      },
      0,
    ]);

  });

  it('dom should have matching node attributes VignetteTableCellNodeSpec', () => {

    const node = p('vignette', 'marginLeft');
    let nodeSpec1: NodeSpec = { toDOM: (node: Node) => ['test', { vignette: 'false', marginLeft: '10px' }], parseDOM: [{ getAttrs: (node: string | HTMLElement) => { return { marginLeft: '10px', vignette: 'true' } } }] }
    const dom = document.createElement('span')
    expect(VignetteTableCellNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([
      "test",
      {
        "marginLeft": "10px",
        "vignette": undefined,
      }

    ])

    VignetteTableCellNodeSpec(nodeSpec1).parseDOM[0].getAttrs(dom);

  })
  it('dom should have matching node attributes VignetteTableCellNodeSpec if statement coverage', () => {


    const schema = createEditor(doc(p('<cursor>'))).schema;
    const newSchema = new VignettePlugin().getEffectiveSchema(schema);
    const node = newSchema.nodes.table_cell.create({ vignette: true, style: '' }, Fragment.empty)


    let nodeSpec1: NodeSpec = { toDOM: (node: Node) => ['test', { vignette: true, marginLeft: '10px', style: true }], parseDOM: [{ getAttrs: (node: string | HTMLElement) => { return { marginLeft: '10px', vignette: true } } }] }
    const dom = document.createElement('span')
    expect(VignetteTableCellNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([

      "test",
      {
        "marginLeft": "10px",
        "vignette": true,
        "style": "trueborder-radius: 10px; border-style: solid; border-width: thin"
      }

    ])

    VignetteTableCellNodeSpec(nodeSpec1).parseDOM[0].getAttrs(dom);

  })

})
