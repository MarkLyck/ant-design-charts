import React, { useRef, createRef } from 'react';
import { create } from 'react-test-renderer';
import { renderHook } from '@testing-library/react-hooks';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import WordCloud from '../../src/plots/wordCloud';
import ChartLoading from '../../src/util/createLoading';
import { ErrorBoundary } from '../../src/base';

const refs = renderHook(() => useRef());

describe('WordCloud render', () => {
  let container;
  const data = [
    {
      x: 'China',
      value: 1383220000,
      category: 'asia',
    },
    {
      x: 'India',
      value: 1316000000,
      category: 'asia',
    },
  ];
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('classname * loading * style', () => {
    const props = {
      style: {
        height: '80%',
      },
      className: 'container',
      loading: true,
    };
    const testRenderer = create(<WordCloud {...props} />);
    const testInstance = testRenderer.root;
    const renderTree = testRenderer.toTree();
    expect(renderTree.rendered[0].nodeType).toBe('component');
    expect(renderTree.rendered[1].props.className).toBe('container');
    expect(renderTree.rendered[1].props.style).toEqual({
      height: '80%',
    });
    expect(renderTree.rendered[1].nodeType).toBe('host');
    expect(renderTree.rendered[1].type).toBe('div');
    expect(testInstance.findAllByType(ChartLoading).length).toBe(1);
  });

  it('classname * loading * style with default', () => {
    const props = {};
    const testRenderer = create(<WordCloud {...props} />);
    const testInstance = testRenderer.root;
    const renderTree = testRenderer.toTree();
    expect(renderTree.rendered.nodeType).toBe('host');
    expect(renderTree.rendered.type).toBe('div');
    expect(renderTree.rendered.props.className).toBeUndefined();
    expect(testInstance.findAllByType(ChartLoading).length).toBe(0);
    expect(renderTree.rendered.props.style).toEqual({
      height: 'inherit',
    });
  });

  it('error template', () => {
    const props = {
      loading: true,
      // An object of type loadingTemplate is only used to trigger a boundary error
      loadingTemplate: {
        triggleError: true,
      },
      errorTemplate: () => <span id="error">custom error</span>,
    };
    const chartProps = {
      data: [],
      wordField: 'x',
      weightField: 'value',
      autoFit: false,
      width: '200',
      height: '160',
    };
    const testRenderer = create(<WordCloud {...props} {...chartProps} />);
    const testInstance = testRenderer.root;
    expect(testInstance.findByType(ErrorBoundary).children[0].children).toEqual(['custom error']);
  });

  it('chart render * chartRef with callback', () => {
    let chartRef = undefined;
    const props = {
      className: 'container',
      chartRef: (ref) => {
        chartRef = ref;
      },
    };
    const chartProps = {
      data,
      wordField: 'x',
      weightField: 'value',
      autoFit: false,
      width: 200,
      height: 160,
    };
    act(() => {
      const root = createRoot(container);
      root.render(<WordCloud {...props} {...chartProps} />);
    });
    expect(chartRef).not.toBeUndefined();
    const canvas = container.querySelector('canvas');
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(160);
    expect(chartRef.chart.getOptions().legends).toBe(false);
  });

  it('chartRef with createRef', () => {
    const chartRef = createRef();
    const props = {
      className: 'container',
      chartRef,
    };
    const chartProps = {
      data,
      wordField: 'x',
      weightField: 'value',
      autoFit: false,
      width: 200,
      height: 160,
    };
    act(() => {
      const root = createRoot(container);
      root.render(<WordCloud {...props} {...chartProps} />);
    });
    expect(chartRef.current.chart.getOptions().legends).toBe(false);
  });

  it('chartRef with useRef', () => {
    const props = {
      className: 'container',
    };
    const chartProps = {
      data,
      wordField: 'x',
      weightField: 'value',
      autoFit: false,
      width: 200,
      height: 160,
    };
    act(() => {
      const root = createRoot(container);
      root.render(<WordCloud {...props} {...chartProps} ref={refs} />);
    });
    expect(refs.current.getChart().chart.getOptions().legends).toBe(false);
  });
});
