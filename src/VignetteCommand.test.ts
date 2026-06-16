import {VignetteCommand} from './VignetteCommand';
import {schema} from 'prosemirror-test-builder';
import {Schema} from 'prosemirror-model';
import {tableNodes} from 'prosemirror-tables';
import {EditorState, Transaction, TextSelection} from 'prosemirror-state';
import {createEditor, doc, p} from 'jest-prosemirror';
import {EditorView} from 'prosemirror-view';
import {Transform} from 'prosemirror-transform';
import {VignettePlugin} from './VignettePlugin';

describe('vignette command', () => {
  const editor = createEditor(doc(p('<cursor>')), {});
  const state: EditorState = EditorState.create({
    schema: schema,
    selection: editor.selection,
  });
  const directeditorprops = {state};
  const dom = document.createElement('div');

  const view = new EditorView(dom, directeditorprops);

  it('should handle isEnabled and call __isEnabled', () => {
    let vignettecommand = new VignetteCommand();
    const spy = jest
      .spyOn(vignettecommand, '__isEnabled')
      .mockImplementation(() => {
        return true;
      });
    vignettecommand.isEnabled(state, view);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle __isEnabled', () => {
    let vignettecommand = new VignetteCommand();
    expect(vignettecommand.__isEnabled(state, view)).toBeTruthy();
  });

  it('should handle vignette command insert table !tr.selection || !tr.doc', () => {
    let transactions: Transaction = [] as unknown as Transaction;

    const vignettecommand = new VignetteCommand();

    expect(
      vignettecommand.insertTable(transactions, schema, 1, 2)
    ).toBeTruthy();
  });
  it('should handle selection validation in insertTable', () => {
    const vignettecommand = new VignetteCommand();

    const sampleSchema = schema;

    const trWithCursorSelection = state.tr;
    trWithCursorSelection.setSelection(
      TextSelection.create(trWithCursorSelection.doc, 2)
    );
    const resultWithCursorSelection = vignettecommand.insertTable(
      trWithCursorSelection,
      sampleSchema,
      1,
      2
    );
    expect(resultWithCursorSelection).toBeTruthy();

    const trWithNonEmptySelection = state.tr;
    trWithNonEmptySelection.setSelection(
      TextSelection.create(trWithNonEmptySelection.doc, 1, 2)
    );
    const resultWithNonEmptySelection = vignettecommand.insertTable(
      trWithNonEmptySelection,
      sampleSchema,
      1,
      2
    );

    expect(resultWithNonEmptySelection).toBe(trWithNonEmptySelection);
  });

  it('should cancel', () => {
    const command = new VignetteCommand();
    expect(command.cancel()).toBeNull();
  });

  it('should render label', () => {
    const command = new VignetteCommand();
    expect(command.renderLabel()).toBeNull();
  });

  it('should be active', () => {
    const command = new VignetteCommand();
    expect(command.isActive()).toBeTruthy();
  });

  it('should execute Custom', () => {
    const command = new VignetteCommand();
    const mockState = null as unknown as EditorState;
    const mockTr = {} as unknown as Transform;
    expect(command.executeCustom(mockState, mockTr)).toBe(mockTr);
  });

  it('should execute Custom style for table', () => {
    const command = new VignetteCommand();
    const mockState = null as unknown as EditorState;
    const mockTr = {} as unknown as Transform;
    expect(command.executeCustomStyleForTable(mockState, mockTr)).toBe(mockTr);
  });

  it('should insert vignette inside a landscape section without an out-of-range position', () => {
    const baseSchema = new Schema({
      nodes: {
        doc: {content: 'block+'},
        paragraph: {
          content: 'inline*',
          group: 'block',
          parseDOM: [{tag: 'p'}],
          toDOM: () => ['p', 0],
        },
        landscape_section: {
          content: 'block+',
          group: 'block',
          defining: true,
          isolating: true,
          parseDOM: [{tag: 'section.section-landscape'}],
          toDOM: () => ['section', {class: 'section-landscape'}, 0],
        },
        text: {group: 'inline'},
        ...tableNodes({
          tableGroup: 'block',
          cellContent: 'block+',
          cellAttributes: {},
        }),
      },
      marks: {},
    });
    const effectiveSchema = new VignettePlugin().getEffectiveSchema(baseSchema);
    const landscape = effectiveSchema.nodes.landscape_section.create(
      null,
      effectiveSchema.nodes.paragraph.create()
    );
    const landscapeDoc = effectiveSchema.nodes.doc.create(null, landscape);
    const landscapeState = EditorState.create({
      doc: landscapeDoc,
      selection: TextSelection.create(landscapeDoc, 2),
      schema: effectiveSchema,
    });

    const command = new VignetteCommand();
    let nextState = landscapeState;

    expect(() => {
      command.execute(
        landscapeState,
        tr => {
          nextState = landscapeState.apply(tr);
        },
        null
      );
    }).not.toThrow();

    const landscapeNode = nextState.doc.firstChild;
    const tableNode = landscapeNode.child(1);
    expect(tableNode.type.name).toBe('table');
    expect(tableNode.attrs.vignette).toBe(true);
    expect(landscapeNode.child(2).type.name).toBe('paragraph');
  });
});
