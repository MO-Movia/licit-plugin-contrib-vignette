import './czi-inline-editor.css';
import {CustomButton} from '@modusoperandi/licit-ui-commands';
import * as React from 'react';
import Icon from './Icon';

export type PropValue = {
  value?: string;
  text?: string;
  label?: string;
};

const ICON_LABEL_PATTERN = /\[([A-Za-z_\d]+)\](.*)/;

type parseLabeltype = {
  icon;
  title;
};

type Key = 'NONE' | 'LEFT' | 'CENTER' | 'RIGHT';

const VignetteAlignValues: {[key in Key]: PropValue} = {
  NONE: {
    value: null,
    text: 'Inline',
    label: '[format_align_justify] Justify',
  },
  LEFT: {
    value: 'left',
    text: 'Float left',
    label: '[format_align_left] Left Align',
  },
  CENTER: {
    value: 'center',
    text: 'Break text',
    label: '[format_align_center] Center Align',
  },
  RIGHT: {
    value: 'right',
    text: 'Float right',
    label: '[format_align_right] Right Align',
  },
};

export type VignetteInlineEditorValue = {
  align?: string;
};

class VignetteInlineEditor extends React.PureComponent {
  props: {
    onSelect: (val: VignetteInlineEditorValue) => void;
    value?: VignetteInlineEditorValue;
  };


  render(): React.ReactNode {
    const align = this.props.value ? this.props.value.align : null;
    const onClick = this._onClick;
    const buttons = Object.keys(VignetteAlignValues).map((key) => {
      const {value, text, label} = VignetteAlignValues[key];
      const {icon} = this.parseLabel(label);
      return (
        <CustomButton
          active={align === value}
          icon={icon}
          key={key}
          onClick={onClick}
          title={text}
          value={value}
        />
      );
    });

    return <div className="molv-czi-inline-editor">{buttons}</div>;
  }

  parseLabel(input: string): parseLabeltype {
    const matched = input.match(ICON_LABEL_PATTERN);
    if (matched) {
      const icon = matched[1];
      const label = matched[2];
      return {
        icon: icon ? Icon.get(icon) : null,
        title: label || null,
      };
    }
    return {
      icon: null,
      title: input || null,
    };
  }

  _onClick = (align?: string): void => {
    this.props.onSelect({align: align});
  };
}

export default VignetteInlineEditor;
