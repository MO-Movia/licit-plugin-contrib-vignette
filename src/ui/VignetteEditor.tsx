import * as React from 'react';
import PropTypes from 'prop-types';
import {
  preventEventDefault,
  CustomButton,
} from '@modusoperandi/licit-ui-commands';

import './czi-form.css';
import './czi-video-url-editor.css';

type VignetteEditorProps = {
  initialValue;
  close: (val?) => void;
};
export type VignetteEditorState = {
  id: string;
  width: number;
  height: number;
};

class VignetteEditor extends React.PureComponent<
  VignetteEditorProps,
  VignetteEditorState
> {
  // [FS] IRAD-1005 2020-07-07
  // Upgrade outdated packages.
  // To take care of the property type declaration.
  static propsTypes = {
    initialValue: PropTypes.object,
    close: function (props: VignetteEditorProps, propName: string): Error {
      const fn = props[propName];
      if (
        !fn.prototype ||
        (typeof fn.prototype.constructor !== 'function' &&
          fn.prototype.constructor.length !== 1)
      ) {
        return new Error(
          propName + 'must be a function with 1 arg of type ImageLike'
        );
      }
      return null;
    },
  };

  state = {
    ...(this.props.initialValue || {}),
  };

  /*componentWillUnmount(): void {

  }*/

  render(): React.ReactNode {
    const {width, height} = this.state;

    return (
      <div className="czi-image-url-editor">
        <form className="czi-form" onSubmit={preventEventDefault}>
          <fieldset>
            <legend>
              <b>Insert Vignette</b>
            </legend>
            <div className="czi-image-url-editor-src-input-row"></div>
          </fieldset>
          <fieldset></fieldset>
          <fieldset>
            <legend>Width</legend>
            <div className="czi-image-url-editor-src-input-row">
              <input
                className="czi-image-url-editor-src-input"
                onChange={this._onWidthChange}
                placeholder="Width"
                type="text"
                value={width || ''}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>Height</legend>
            <div className="czi-image-url-editor-src-input-row">
              <input
                className="czi-image-url-editor-src-input"
                onChange={this._onHeightChange}
                placeholder="Height"
                type="text"
                value={height || ''}
              />
            </div>
          </fieldset>
          <div className="czi-form-buttons">
            <CustomButton label="Cancel" onClick={this._cancel} />
            <CustomButton
              active={true}
              disabled={false}
              label="Insert"
              onClick={this._insert}
            />
          </div>
        </form>
      </div>
    );
  }

  _onWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = e.target.value as unknown as number;
    this.setState({
      width,
    });
  };

  _onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = e.target.value as unknown as number;
    this.setState({
      height,
    });
  };

  _cancel = (): void => {
    this.props.close();
  };

  _insert = (): void => {
    this.props.close(this.state);
  };
}

export default VignetteEditor;
