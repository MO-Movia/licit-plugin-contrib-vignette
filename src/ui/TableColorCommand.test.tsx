import TableColorCommand from './TableColorCommand';
import { schema } from 'prosemirror-test-builder';
import { EditorState } from 'prosemirror-state';
import { createEditor, doc, p } from 'jest-prosemirror';
import React from 'react';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
describe('Table color command', () => {
  
  const tableColorCommand = new TableColorCommand();
  const editor = createEditor(doc(p('<cursor>')), {});
  const state: EditorState = EditorState.create({
    schema: schema,
    selection: editor.selection,
  });
  const directeditorprops = { state };
  const dom = document.createElement('div');

  const view = new EditorView(dom, directeditorprops);

  const mouseevent = {
    type: 'mouseenter'
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

  it('should wait for user input and return true', () => {
    expect(tableColorCommand.waitForUserInput(state, editor.view.dispatch as (tr: Transform) => void, view, mouseevent)).toBeTruthy();
  });

  it('should wait for user input and return true when popUp is not null', () => {
    tableColorCommand._popUp = { close: () => { return null; }, update: () => { return null; } };
    expect(tableColorCommand.waitForUserInput(state, editor.view.dispatch as (tr: Transform) => void, view, mouseevent)).toBeTruthy();
  });

  it('should wait for user input and return true when even.currenttarget is html element instance', () => {
    tableColorCommand._popUp = null;
    const mouseevent_new = {
      currentTarget: document.createElement('div'),
    } as React.ChangeEvent<HTMLInputElement>;

    expect(tableColorCommand.waitForUserInput(state, editor.view.dispatch as (tr: Transform) => void, view, mouseevent_new)).toBeTruthy();
  });


  it('should execute with user input and return true', () => {
    expect(tableColorCommand.executeWithUserInput(state, editor.view.dispatch as (tr: Transform) => void, view, 'blue')).toBeTruthy();
  });

  it('should execute with user input and return false', () => {
    expect(tableColorCommand.executeWithUserInput(state, editor.view.dispatch as (tr: Transform) => void, view, undefined)).toBeFalsy();
  });

  it('should call popUp close', () => {
    const popUp = { close: () => { return null; }, update: () => { return null; } };
    tableColorCommand._popUp = popUp;
    const spy = jest.spyOn(tableColorCommand._popUp, 'close');
    tableColorCommand.cancel();
    expect(spy).toHaveBeenCalled();
  });


});
