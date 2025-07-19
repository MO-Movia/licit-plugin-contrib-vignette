import {TableColorCommand} from './TableColorCommand';
import {schema} from 'prosemirror-test-builder';
import {EditorState} from 'prosemirror-state';
import {createEditor, doc, p} from 'jest-prosemirror';
import React from 'react';
import {EditorView} from 'prosemirror-view';
import {Transform} from 'prosemirror-transform';
import { PopUpHandle } from '@modusoperandi/licit-ui-commands';

describe('Table color command', () => {
  jest.mock('prosemirror-tables', () => {
    return {
      ...jest.requireActual('prosemirror-tables'),
      setCellAttr: jest.fn(),
    };
  });

  const tableColorCommand = new TableColorCommand();
  const editor = createEditor(doc(p('<cursor>')), {});
  const state: EditorState = EditorState.create({
    schema: schema,
    selection: editor.selection,
  });
  const directeditorprops = {state};
  const dom = document.createElement('div');

  const view = new EditorView(dom, directeditorprops);

  const mouseevent = {
    type: 'mouseenter',
  } as React.ChangeEvent<HTMLInputElement>;

  it('should return string', () => {
    expect(typeof tableColorCommand.getAttrName()).toBe('string');
  });

  it('should return true', () => {
    expect(tableColorCommand.isEnabled(state)).toBeTruthy();
  });

  it('should return true', () => {
    expect(tableColorCommand.shouldRespondToUIEvent(mouseevent)).toBeTruthy();
  });

  it('should call popUp close', () => {
    const popUp = {
      close: () => {
        return null;
      },
      update: () => {
        return null;
      },
    };
    tableColorCommand._popUp = popUp;
    const spy = jest.spyOn(tableColorCommand._popUp, 'close');
    tableColorCommand.cancel();
    expect(spy).toHaveBeenCalled();
  });


  it('should wait for user input and return false when event.currentTarget is not an HTML element', async () => {
    tableColorCommand._popUp = undefined;
    const invalidMouseEvent = {
      currentTarget: null,
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    const result = await tableColorCommand.waitForUserInput(
      state,
      undefined,
      undefined,
      invalidMouseEvent
    );
    expect(result).toBeFalsy();
  });

  it('should wait for user input and return false when event.currentTarget is not an HTML element', async () => {
    const invalidMouseEvent = {
      currentTarget: document.createElement('div'),
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    const result = tableColorCommand.waitForUserInput(
      state,
      undefined,
      undefined,
      invalidMouseEvent
    );
    tableColorCommand._popUp?.close(false);
    expect(await result).toBeFalsy();
  });




  it('should return a resolved promise when _popUp is truthy', async () => {
    tableColorCommand._popUp = {} as unknown as PopUpHandle;

    const result = await tableColorCommand.waitForUserInput(
      state,
      undefined,
      undefined,
      mouseevent
    );
    expect(result).toBeUndefined();
  });

  it('should execute with user input and return true when dispatch and color are defined', () => {
    const dispatchMock = jest.fn();
    const color = 'blue';

    const result = tableColorCommand.executeWithUserInput(
      state,
      dispatchMock,
      view,
      color
    );
    expect(result).toBeTruthy();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('should cancel', () => {
    tableColorCommand._popUp = undefined;
    expect(tableColorCommand.cancel()).toBeFalsy();
  });

  it('should render label', () => {
    expect(tableColorCommand.renderLabel()).toBeNull();
  });

  it('should be active', () => {
    expect(tableColorCommand.isActive()).toBeTruthy();
  });

  it('should execute Custom', () => {
    const mockState = null as unknown as EditorState;
    const mockTr = {} as unknown as Transform;
    expect(tableColorCommand.executeCustom(mockState, mockTr)).toBe(mockTr);
  });

  it('should execute with user input', () => {
    const mockState = null as unknown as EditorState;
    expect(tableColorCommand.executeWithUserInput(mockState)).toBeFalsy();
  });
});
