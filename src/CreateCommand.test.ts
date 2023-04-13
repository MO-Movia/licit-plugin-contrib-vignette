import createCommand from "./CreateCommand";
import { schema } from 'prosemirror-test-builder';
import { EditorState} from 'prosemirror-state';
import { createEditor, doc, p } from 'jest-prosemirror';
import { EditorView } from 'prosemirror-view';

describe('create command', () => {
  it('should return new custom command', () => {
    const editor = createEditor(doc(p('<cursor>')), {});

    //const wrapper = shallow(<TableColorCommand />);
    const state: EditorState = EditorState.create({
      schema: schema,
      selection: editor.selection,


    });
    const directeditorprops = { state }
    const dom = document.createElement('div')

    const view = new EditorView(dom, directeditorprops);
    let dispatch = (tr) => {
      return tr;
    }

    let executecall = (state, dispatch, view) => {
      return true
    }

    expect(createCommand(executecall)).toBeDefined();

  })
})