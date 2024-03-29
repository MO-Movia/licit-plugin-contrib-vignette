import {VignetteCommand} from './VignetteCommand';
import {schema} from 'prosemirror-test-builder';
import {EditorState, Transaction, TextSelection} from 'prosemirror-state';
import {createEditor, doc, p} from 'jest-prosemirror';
import {EditorView} from 'prosemirror-view';
import {Transform} from 'prosemirror-transform';

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
});
