import {VignetteMenuPlugin} from './VignetteMenuPlugin';
import {EditorState} from 'prosemirror-state';
import {VignetteView} from './VignetteMenuPlugin';
import {EditorView} from 'prosemirror-view';
import {createEditor, doc, p, schema} from 'jest-prosemirror';
import {Fragment} from 'prosemirror-model';
import {VignettePlugin} from './VignettePlugin';
import {VignettePlugins} from './index';
import {CellSelection, deleteTable, TableView} from 'prosemirror-tables';
import {TableBackgroundColorCommand} from './TableBackgroundColorCommand';
import {TableBorderColorCommand} from './TableBorderColorCommand';
import {createCommand} from './CreateCommand';

const TABLE_BACKGROUND_COLOR = new TableBackgroundColorCommand();
const TABLE_BORDER_COLOR = new TableBorderColorCommand();
const TABLE_DELETE_TABLE = createCommand(deleteTable);

describe('VignetteMenuPlugin', () => {
  const editor = createEditor(doc(p('<cursor>')), {
    plugins: [...VignettePlugins],
  });
  const node1 = schema.nodes.table_cell.create(
    {vignette: true, style: ''},
    Fragment.empty
  );
  const state: EditorState = EditorState.create({
    schema: schema,
    selection: editor.selection,
    plugins: [new VignetteMenuPlugin()],
  });

  const directeditorprops = {state, focus};

  const dom = document.createElement('div');
  dom.setAttribute('style', 'margin-left: 10px');

  const schema1 = createEditor(doc(p('<cursor>'))).schema;
  const newSchema = new VignettePlugin().getEffectiveSchema(schema1);
  const node = newSchema.nodes.table.create(
    {marginLeft: '10px', vignette: 'true'},
    Fragment.empty
  );
  const view = new EditorView(dom, directeditorprops);
  let v = new VignetteView(view);

  it('dom should call setCustomMenu', () => {
    expect(VignetteView.isVignette(view.state, node)).toBeTruthy();
  });

  it('dom should call setCustomMenu', () => {
    const editor = createEditor(doc(p('<cursor>')), {
      plugins: [...VignettePlugins],
    });
    const state: EditorState = EditorState.create({
      schema: schema,
      selection: editor.selection as CellSelection,
      plugins: [new VignetteMenuPlugin()],
    });
    expect(VignetteView.isVignette(state, node)).toBeTruthy();
  });

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
    expect(
      vignetteview.getMenu(state, node, VIGNETTE_COMMANDS_GROUP)
    ).toBeTruthy();
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
    const spy = jest.spyOn(VignetteView, 'isVignette').mockReturnValue(false);
    expect(
      vignetteview.getMenu(state, node, VIGNETTE_COMMANDS_GROUP)
    ).toBeTruthy();
  });

  it('should correctly initialize getMenu and tableNodeViewEx', () => {
    const editor = createEditor(doc(p('<cursor>')));
    const state = EditorState.create({
      schema: editor.schema,
      selection: editor.selection,
      plugins: [new VignetteMenuPlugin()],
    });

    const view = new EditorView(document.createElement('div'), {state});
    const vignetteView = new VignetteView(view);

    expect(typeof vignetteView.getMenu).toBe('function');
    expect(typeof vignetteView.tableNodeViewEx).toBe('function');
  });

  it('should set custom node view and update nodeViews if index is not -1', () => {
    const editorView = {
      nodeViews: {table: 'originalTableNodeView'},
      state: {
        plugins: [
          {spec: {key: {key: 'tableColumnResizing$'}, props: {nodeViews: {}}}},
        ],
      },
    };

    const vignetteView = new VignetteView(view);
    const tableNodeViewExSpy = jest.fn();
    vignetteView.setCustomTableNodeViewUpdate({
      ...editorView,
      nodeViews: {table: 'originalTableNodeView'},
    } as unknown as EditorView);

    expect(editorView.nodeViews['table']).toBeDefined();

    const pluginIndex = editorView.state.plugins.findIndex((plugin) =>
      plugin.spec.key?.key.includes('tableColumnResizing$')
    );
    const updatedNodeView =
      editorView.state.plugins[pluginIndex].spec.props.nodeViews['table'];
    expect(updatedNodeView).toBeDefined();
  });

  it('should not call updateEx or updateBorder when node does not have vignette attribute', () => {
    const mockTableNodeView = jest.fn();
    mockTableNodeView.mockReturnValue({
      update: jest.fn(),
    });

    const vignetteView = new VignetteView(view);

    const mockNode = {attrs: {vignette: false}} as unknown as any;

    const mockView = {} as unknown as EditorView;

    const result = vignetteView.tableNodeViewEx(
      mockTableNodeView,
      mockNode,
      mockView
    );

    expect(mockTableNodeView).toHaveBeenCalledWith(mockNode, mockView);
    expect(result.update).toBeDefined();
    expect(result.update).not.toHaveBeenCalled();
  });

  it('should not call updateEx or updateBorder when update returns false', () => {
    const mockTableView = {
      table: {
        style: {
          border: undefined,
        },
      },
    } as unknown as TableView;
    const vignetteView = new VignetteView(view);
    const mockUpdate = jest.fn(() => false);
    const node = newSchema.nodes.table.create(
      {marginLeft: '10px', vignette: 'true'},
      Fragment.empty
    );
    const result = vignetteView.updateEx(mockUpdate, vignetteView, node);
    expect(mockUpdate).toHaveBeenCalled();

    expect(mockTableView.table.style.border).toBeUndefined();

    expect(result).toBe(false);
  });
});
