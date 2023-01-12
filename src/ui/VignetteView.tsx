import cx from 'classnames';
import {DOMSerializer, Node} from 'prosemirror-model';
import {EditorView, Decoration} from 'prosemirror-view';
import {EditorState, NodeSelection, Plugin} from 'prosemirror-state';
import {StepMap} from 'prosemirror-transform';
import {undo, redo} from 'prosemirror-history';
import {keymap} from 'prosemirror-keymap';

import * as React from 'react';
import ReactDOM from 'react-dom';

import CustomNodeView from './CustomNodeView';
import VignetteResizeBox, {MIN_SIZE} from './VignetteResizeBox';
import {
  atAnchorBottomCenter,
  createPopUp,
} from '@modusoperandi/licit-ui-commands';
import ResizeObserver from './ResizeObserver';
import uuid from './uuid';

import './czi-vignette-view.css';

import type {NodeViewProps} from './CustomNodeView';
import type {ResizeObserverEntry} from './ResizeObserver';
import VignetteInlineEditor from './VignetteInlineEditor';
const FRAMESET_BODY_CLASSNAME = 'czi-editor-frame-body';
const EMPTY_SRC =
  'data:image/gif;base64,' +
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export type clipStyleType = {
  width?;
  height?;
  transform?;
};

export type videoStyleType = {
  display?: string;
  height?;
  left?;
  top?;
  width?;
  position?;
};

/* This value must be synced with the margin defined at .czi-vignette-view */
const VIGNETTE_MARGIN = 2;

const MAX_SIZE = 100000;
const VIGNETTE_PLACEHOLDER_SIZE = 24;

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;

const DEFAULT_ORIGINAL_SIZE = {
  src: '',
  complete: true,
  height: MIN_HEIGHT,
  width: MIN_WIDTH,
};

// Get the maxWidth that the image could be resized to.
function getMaxResizeWidth(el): number {
  // Ideally, the image should bot be wider then its containing element.
  let node = el.parentElement;
  while (node && !node.offsetParent) {
    node = node.parentElement;
  }
  if (
    node &&
    node.offsetParent &&
    node.offsetParent.offsetWidth &&
    node.offsetParent.offsetWidth > 0
  ) {
    const {offsetParent} = node;
    const style = el.ownerDocument.defaultView.getComputedStyle(offsetParent);
    let width = offsetParent.clientWidth - VIGNETTE_MARGIN * 2;
    if (style.boxSizing === 'border-box') {
      const pl = parseInt(style.paddingLeft, 10);
      const pr = parseInt(style.paddingRight, 10);
      width -= pl + pr;
    }
    return Math.max(width, MIN_SIZE);
  }
  // Let the image resize freely.
  return MAX_SIZE;
}

class VignetteViewBody extends React.PureComponent {
  props: NodeViewProps;

  _body = null;
  _id = uuid();
  _inlineEditor = null;
  _mounted = false;

  state = {
    maxSize: {
      width: MAX_SIZE,
      height: MAX_SIZE,
      complete: false,
    },
    originalSize: DEFAULT_ORIGINAL_SIZE,
  };

  componentDidMount(): void {
    this._mounted = true;
    this._resolveOriginalSize();
    this._renderInlineEditor();
  }

  componentWillUnmount(): void {
    this._mounted = false;
    this._inlineEditor && this._inlineEditor.close();
    this._inlineEditor = null;
  }

  componentDidUpdate(prevProps: NodeViewProps): void {
    const prevSrc = prevProps.node.attrs.src;
    const {node} = this.props;
    const {src} = node.attrs;
    if (prevSrc !== src) {
      // A new image is provided, resolve it.
      this._resolveOriginalSize();
    }
    this._renderInlineEditor();
  }

  render(): React.ReactElement {
    const {originalSize, maxSize} = this.state;
    const {editorView, node, selected, focused} = this.props;
    const {readOnly} = editorView;
    const {attrs} = node;
    const {crop, rotate} = attrs;

    // It's only active when the image's fully loaded.
    const loading = false;
    const active = !loading && focused && !readOnly && originalSize.complete;
    const src = originalSize.complete ? originalSize.src : EMPTY_SRC;
    const aspectRatio = loading ? 1 : originalSize.width / originalSize.height;
    const error = !loading && !originalSize.complete;

    let {width, height} = attrs;

    if (loading) {
      width = width || VIGNETTE_PLACEHOLDER_SIZE;
      height = height || VIGNETTE_PLACEHOLDER_SIZE;
    }

    if (width && !height) {
      height = width / aspectRatio;
    } else if (height && !width) {
      width = height * aspectRatio;
    } else if (!width && !height) {
      width = originalSize.width;
      height = originalSize.height;
    }

    let scale = 1;
    if (width > maxSize.width && (!crop || crop.width > maxSize.width)) {
      // Scale image to fit its containing space.
      // If the image is not cropped.
      width = maxSize.width;
      height = width / aspectRatio;
      scale = maxSize.width / width;
    }

    const className = cx('molv-czi-vignette-view-body', {
      active,
      error,
      focused,
      loading,
      selected,
    });

    const resizeBox =
      active && !crop && !rotate ? (
        <VignetteResizeBox
          height={height}
          onResizeEnd={this._onResizeEnd}
          src={src}
          width={width}
        />
      ) : null;

    const vignettesStyle: videoStyleType = {
      display: 'inline-block',
      height: height + 'px',
      left: '0',
      top: '0',
      width: width + 'px',
      position: 'relative',
    };

    const clipStyle: clipStyleType = {};
    if (crop) {
      const cropped = {...crop};
      if (scale !== 1) {
        scale = maxSize.width / cropped.width;
        cropped.width *= scale;
        cropped.height *= scale;
        cropped.left *= scale;
        cropped.top *= scale;
      }
      clipStyle.width = cropped.width + 'px';
      clipStyle.height = cropped.height + 'px';
      vignettesStyle.left = cropped.left + 'px';
      vignettesStyle.top = cropped.top + 'px';
    }

    if (rotate) {
      clipStyle.transform = `rotate(${rotate}rad)`;
    }

    return (
      <span
        className={className}
        data-active={active ? 'true' : undefined}
        id={this._id}
        ref={this._onBodyRef}
      >
        <span
          className="molv-czi-vignette-view-body-img-clip"
          style={clipStyle}
        >
          <span style={vignettesStyle}></span>
        </span>
        {resizeBox}
      </span>
    );
  }

  _renderInlineEditor(): void {
    const el = document.getElementById(this._id);
    if (!el || el.getAttribute('data-active') !== 'true') {
      this._inlineEditor && this._inlineEditor.close();
      return;
    }

    const {node} = this.props;
    const editorProps = {
      value: node.attrs,
      onSelect: this._onChange,
    };
    if (this._inlineEditor) {
      this._inlineEditor.update(editorProps);
    } else {
      this._inlineEditor = createPopUp(VignetteInlineEditor, editorProps, {
        anchor: el,
        autoDismiss: false,
        container: el.closest(`.${FRAMESET_BODY_CLASSNAME}`),
        position: atAnchorBottomCenter,
        onClose: () => {
          this._inlineEditor = null;
        },
      });
    }
  }

  _resolveOriginalSize = async (): Promise<void> => {
    if (!this._mounted) {
      // unmounted;
      return;
    }

    this.setState({originalSize: DEFAULT_ORIGINAL_SIZE});
    const originalSize = DEFAULT_ORIGINAL_SIZE;
    if (!this._mounted) {
      // unmounted;
      return;
    }
    this.setState({originalSize});
  };

  _onResizeEnd = (width: number, height: number): void => {
    const {getPos, node, editorView} = this.props;
    const pos = getPos();
    const attrs = {
      ...node.attrs,
      crop: null,
      width,
      height,
    };

    let tr = editorView.state.tr;
    const {selection} = editorView.state;
    tr = tr.setNodeMarkup(pos, null, attrs);
    // [FS] IRAD-1005 2020-07-09
    // Upgrade outdated packages.
    // reset selection to original using the latest doc.
    const origSelection = NodeSelection.create(tr.doc, selection.from);
    tr = tr.setSelection(origSelection);
    editorView.dispatch(tr);
  };

  _onChange = (value: {align: string}): void => {
    if (!this._mounted) {
      return;
    }

    const align = value ? value.align : null;
    const {getPos, node, editorView} = this.props;
    const pos = getPos();
    const attrs = {
      ...node.attrs,
      align,
    };

    let tr = editorView.state.tr;
    const {selection} = editorView.state;
    tr = tr.setNodeMarkup(pos, null, attrs);
    // [FS] IRAD-1005 2020-07-09
    // Upgrade outdated packages.
    // reset selection to original using the latest doc.
    const origSelection = NodeSelection.create(tr.doc, selection.from);
    tr = tr.setSelection(origSelection);
    editorView.dispatch(tr);
  };

  _onBodyRef = (ref): void => {
    if (ref) {
      this._body = ref;
      // Mounting
      const el = ReactDOM.findDOMNode(ref);
      if (el instanceof HTMLElement) {
        ResizeObserver.observe(el, this._onBodyResize);
      }
    } else {
      // Unmounting.
      const el = this._body && ReactDOM.findDOMNode(this._body);
      if (el instanceof HTMLElement) {
        ResizeObserver.unobserve(el);
      }
      this._body = null;
    }
  };

  _onBodyResize = (_info: ResizeObserverEntry): void => {
    const width = this._body
      ? getMaxResizeWidth(ReactDOM.findDOMNode(this._body))
      : MAX_SIZE;

    this.setState({
      maxSize: {
        width,
        height: MAX_SIZE,
        complete: !!this._body,
      },
    });
  };
}

class VignetteView extends CustomNodeView {
  outerView: EditorView;
  innerView: EditorView;

  // @override
  createDOMElement(): HTMLElement {
    const el = document.createElement('span');
    el.style.backgroundColor = 'lightgrey';
    el.style.position = 'relative';

    this._updateDOM(el, MIN_WIDTH, MIN_HEIGHT);
    return el;
  }

  // @override
  renderReactComponent(): React.ReactElement {
    return <VignetteViewBody {...this.props} />;
  }

  _updateDOM(el: HTMLElement, width: number, height: number): void {
    const {align} = this.props.node.attrs;
    let className = 'molv-czi-vignette-view';
    if (align) {
      className += ' align-' + align;
    }
    el.className = className;
    el.style.width = width + 'px';
    el.style.height = height + 'px';

    this.updateInnerDOM(width, height);
  }

  updateInnerDOM(width: number, height: number): void {
    if (this.innerView) {
      this.innerView.dom.style.width = width - 10 + 'px';
      this.innerView.dom.style.height = height - 10 + 'px';
    }
  }

  initialize(node: Node, editorView: EditorView, getPos: () => number): void {
    this.dom.style.height = node.attrs.width;
    this.dom.style.width = node.attrs.height;
    this.dom.style.backgroundColor = node.attrs.backgroundColor;

    this.outerView = editorView;
    DOMSerializer.fromSchema(this.outerView.state.schema).serializeFragment(
      node.content,
      {},
      this.dom
    );
  }

  dispatchInner(tr) {
    const {state, transactions} = this.innerView.state.applyTransaction(tr);
    this.innerView.updateState(state);

    if (!tr.getMeta('fromOutside')) {
      const outerTr = this.outerView.state.tr,
        offsetMap = StepMap.offset(this.props.getPos() + 1);
      for (let i = 0; i < transactions.length; i++) {
        const steps = transactions[i].steps;
        for (let j = 0; j < steps.length; j++)
          outerTr.step(steps[j].map(offsetMap));
      }
      if (outerTr.docChanged) this.outerView.dispatch(outerTr);
    }
  }

  // @override
  update(node: Node, decorations: Array<Decoration>): boolean {
    super.update(node, decorations);
    this._updateDOM(this.dom, node.attrs.width, node.attrs.height);
    if (!node.sameMarkup(this.props.node)) return false;
    if (this.innerView) {
      const state = this.innerView.state;
      const start = node.content.findDiffStart(state.doc.content);
      if (start != null) {
        let {a: endA, b: endB} = node.content.findDiffEnd(state.doc.content);
        const overlap = start - Math.min(endA, endB);
        if (overlap > 0) {
          endA += overlap;
          endB += overlap;
        }
        this.innerView.dispatch(
          state.tr
            .replace(start, endB, node.slice(start, endA))
            .setMeta('fromOutside', true)
        );
      }
    }
    return true;
  }

  selectNode() {
    if (!this.innerView) this.open();
    super.selectNode();
  }

  deselectNode() {
    if (this.innerView) this.close();
    super.deselectNode();
  }

  ignoreMutation() {
    return true;
  }

  open() {
    if (!this.outerView) {
      this.outerView = this.props.editorView;
    }

    const span = document.createElement('span');
    //span.style.display = 'inline-block';
    span.style.width = this.props.node.attrs.width + 'px';
    span.style.height = this.props.node.attrs.height + 'px';

    this.dom.appendChild(span);

    const plugins = [...this.outerView.state.plugins.filter(this.skipPlugins)];

    plugins.forEach((plugin) => {
      plugin.spec.state = undefined;
    });

    this.innerView = new EditorView(
      {mount: span},
      {
        editable: () => this.outerView.editable,
        state: EditorState.create({
          doc: this.node,
          schema: this.outerView.state.schema,
          plugins: [
            ...plugins,
            keymap({
              'Mod-z': () =>
                undo(this.outerView.state, this.outerView.dispatch),
              'Mod-y': () =>
                redo(this.outerView.state, this.outerView.dispatch),
            }),
          ],
        }),
        // This is the magic part
        dispatchTransaction: this.dispatchInner.bind(this),
        handleDOMEvents: {
          mousedown: () => {
            // Kludge to prevent issues due to the fact that the whole
            // footnote is node-selected (and thus DOM-selected) when
            // the parent editor is focused.
            if (this.outerView.hasFocus()) {
              this.innerView.focus();
            }
          },
        },
      }
    );

    if (this.innerView) {
      this.innerView.dom.style.position = 'absolute';
      this.innerView.dom.style.left = '5px';
      this.innerView.dom.style.top = '5px';
      this.updateInnerDOM(this.props.node.attrs.width, this.props.node.attrs.height);
    }
  }

  skipPlugins(plugin: Plugin) {
    const keys = [
      'EditorPageLayoutPlugin',
      'tableColumnResizing',
      'VignettePlugin',
    ];
    const skip = keys.some((v) => plugin['key'].includes(v));
    return !skip;
  }

  close() {
    let html = '';
    if (0 < this.dom.children.length) {
      html = this.dom.children[0].innerHTML;
    }
    if (this.innerView) {
      this.innerView.destroy();
      this.innerView = null;
    }
    this.dom.innerHTML = html;
  }

  destroy() {
    if (this.innerView) this.close();
    super.destroy();
  }

  stopEvent(event: Event): boolean {
    return (
      this.innerView && this.innerView.dom.contains(event.target as HTMLElement)
    );
  }
}

export default VignetteView;
