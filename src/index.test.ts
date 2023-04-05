import {createEditor, doc, p, table, tr, td, schema, strong} from 'jest-prosemirror';
import {builders} from 'prosemirror-test-builder';

import {TABLE} from './Constants';
import VignetteCommand from './VignetteCommand';
import {VignettePlugin} from './VignettePlugin';
//import VignettePlugins from './VignettePlugins';
import {VignettePlugins} from './index';
import createCommand from './CreateCommand';
import TableBackgroundColorCommand from './TableBackgroundColorCommand';
import TableBorderColorCommand from './TableBorderColorCommand';
import { VignetteTableCellNodeSpec,VignetteTableNodeSpec } from './VignetteNodeSpec';
import {Node, NodeSpec} from 'prosemirror-model';
import { object } from 'prop-types';
import VignetteMenuPlugin from './VignetteMenuPlugin';
import {CellSelection, deleteTable, TableView} from 'prosemirror-tables';
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

  it('should return borderColor', () => {
    const tablebrdercolorcommand = new TableBorderColorCommand()
    expect(tablebrdercolorcommand.getAttrName()).toEqual('borderColor');
  });
  it('should handle createCommand', () => {
    const tablebgcolorcommand = new TableBackgroundColorCommand()
    expect(tablebgcolorcommand.getAttrName()).toEqual('background');
  });

  it('should return vignette view', () => {
  const editor = createEditor(doc(p('<cursor>')), {
    plugins: [new VignetteMenuPlugin],
  
  })
  
    
  });


  it('dom should have matching node attributes',()=>{

    const mockToDOM = jest.fn((node) => {
      node.attrs['vignette'] ='true';
      return {
        marginLeft: "10px",
        vignette: true,
      };
    });

    const node = p('bold');
    let nodeSpec1:NodeSpec ={}
  expect(VignetteTableNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([
     
       "table",
        {
         "style": "border: none",
        "vignette": undefined,
        },
       0,
      ])

  })
  it('dom should have matching node attributes',()=>{

    const mockToDOM = jest.fn((node) => {
      node.attrs['vignette'] ='true';
      return {
        marginLeft: "10px",
        vignette: true,
      };
    });

    const node = p('bold');
    let nodeSpec1:NodeSpec ={toDOM:(node: Node) => ['test',{vignette:'false'}]}

    
  expect(VignetteTableCellNodeSpec(nodeSpec1).toDOM(node)).toStrictEqual([
     
      "test",
        {
        
        "vignette": undefined,
        }
      
      ])

  })







  // it('dom should have matching node attributes',()=>{
  //   const plugin = new VignettePlugin();
  // const effSchema = plugin.getEffectiveSchema(schema);
  //   const p = builders(effSchema, {p: {nodeType: 'paragraph'}});

  //   let nodeSpec1:NodeSpec ={}
  //  let node = {attrs:{
  //   marginLeft: '10px',
  //   vignette: true,
  //  }} 
  //  expect(VignetteTableNodeSpec(nodeSpec1).toDOM()).toStrictEqual([
  //   'span',
  //   {
  //     "10px":node.attrs.marginLeft,
  //     true: node.attrs.vignette
      
  //   },
  //  ])
  //  });
})
