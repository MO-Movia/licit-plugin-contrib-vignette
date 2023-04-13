import VignetteMenuPlugin from './VignetteMenuPlugin';
import { EditorState } from 'prosemirror-state';
import { VignetteView } from './VignetteMenuPlugin';
import { EditorView } from 'prosemirror-view';
import { createEditor, doc, p, schema } from 'jest-prosemirror';
import { Fragment } from 'prosemirror-model';
import { VignettePlugin } from './VignettePlugin';
import { VignettePlugins } from './index';
import { CellSelection, deleteTable, TableView } from 'prosemirror-tables';
import TableBackgroundColorCommand from './TableBackgroundColorCommand';
import TableBorderColorCommand from './TableBorderColorCommand';
import createCommand from './CreateCommand';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
export { };

const TABLE_BACKGROUND_COLOR = new TableBackgroundColorCommand();
const TABLE_BORDER_COLOR = new TableBorderColorCommand();
const TABLE_DELETE_TABLE = createCommand(deleteTable);

describe('VignetteMenuPlugin', () => {
  const editor = createEditor(doc(p('<cursor>')), { plugins: [...VignettePlugins] });
  const node1 = schema.nodes.table_cell.create({ vignette: true, style: '' }, Fragment.empty)
  const state: EditorState = EditorState.create({

    schema: schema,
    selection: editor.selection,
    plugins: [new VignetteMenuPlugin()]


  });

  const directeditorprops = { state, focus }

  const dom = document.createElement('div');
  dom.setAttribute('style', 'margin-left: 10px');

  const schema1 = createEditor(doc(p('<cursor>'))).schema;
  const newSchema = new VignettePlugin().getEffectiveSchema(schema1);
  const node = newSchema.nodes.table.create({ marginLeft: '10px', vignette: 'true' }, Fragment.empty)
  const view = new EditorView(dom, directeditorprops);
  let v = new VignetteView(view);

  it('dom should call setCustomMenu', () => {
    expect(VignetteView.isVignette(view.state, node)).toBeTruthy();
  });

  it('dom should call setCustomMenu', () => {
    const editor = createEditor(doc(p('<cursor>')), { plugins: [...VignettePlugins] });
    const state: EditorState = EditorState.create({
      schema: schema,
      selection: editor.selection as CellSelection,
      plugins: [new VignetteMenuPlugin()]
    });
    expect(VignetteView.isVignette(state, node)).toBeTruthy();
  })


  it('dom should call isenabledeex', () => {
    let isenabled = (state, view) => true;

    let vignetteview = new VignetteView(view);
    expect(vignetteview.isEnabledEx(isenabled, state)).toBeTruthy();
  });

  it('dom should call isenabledeex when isvignette is true', () => {
    const spy = jest.spyOn(VignetteView, 'isVignette').mockReturnValue(true);
    let isenabled = (state, view) => true;

    let vignetteview = new VignetteView(view);
    expect(vignetteview.isEnabledEx(isenabled, state)).toBeFalsy();
  });




  it('dom should call getMenu', () => {
    let vignetteview = new VignetteView(view);
    const VIGNETTE_COMMANDS_GROUP = [
      {
        'Fill Color...': TABLE_BACKGROUND_COLOR,
        'Border Color....': TABLE_BORDER_COLOR,
      },
      {
        'Delete Vignette': TABLE_DELETE_TABLE,
      },
    ];
    expect(vignetteview.getMenu(state, node, VIGNETTE_COMMANDS_GROUP)).toBeTruthy();
  });

  it('dom should call getMenu', () => {
    let vignetteview = new VignetteView(view);
    const VIGNETTE_COMMANDS_GROUP = [
      {
        'Fill Color...': TABLE_BACKGROUND_COLOR,
        'Border Color....': TABLE_BORDER_COLOR,
      },
      {
        'Delete Vignette': TABLE_DELETE_TABLE,
      },
    ];
    const spy = jest.spyOn(VignetteView, 'isVignette').mockReturnValue(false)
    expect(vignetteview.getMenu(state, node, VIGNETTE_COMMANDS_GROUP)).toBeTruthy();
  });

  it('dom should call updateEx', () => {
    const editor1 = createEditor(doc(p('<cursor>')))
    const schema = createEditor(doc(p('<cursor>'))).schema;
    const newSchema = new VignettePlugin().getEffectiveSchema(schema);
    const state: EditorState = EditorState.create({
      schema: newSchema,
      selection: editor1.selection

    });

    const directeditorprops = { state }
    const dom = document.createElement('div')

    const view1 = new EditorView(dom, directeditorprops);

    // let vignetteview = new VignetteView(view1)as unknown as TableView;
    const node = newSchema.nodes.table.create({ marginLeft: '10px', vignette: 'true' }, Fragment.empty)
    editor1.doc.content.addToEnd(node);
    let vignetteview = new VignetteView(view1)
    vignetteview.tableNodeViewEx((node, view1) => vignetteview as unknown as TableView, node, view1)


    const node2 = newSchema.nodes.table.create({ marginLeft: '10px', vignette: 'true' }, Fragment.empty)
    vignetteview.tableNodeViewEx((node2, view1) => new TableView(node2, 2), node2, view1)

    let update = (node) => true
    let tableview = new TableView(node, 1)
    vignetteview.updateBorder(tableview)
    expect(vignetteview.updateEx(update, vignetteview, node)).toBeTruthy();
  });

})