import { assert } from 'chai';
import Root from '../';

describe('Root core implementation', () => {

  describe('Root.createElement()', () => {

    it('should work without children', () => {
      const src = Root.createElement('Object', { tree: 'bear' });
      const res = { type: 'Object', props: { tree: 'bear' }};
      assert.deepEqual(src, res);
    });

    it('should work with children', () => {
      const child =  Root.createElement('Object', { test1: 'test1' });
      const src = Root.createElement('Object', { tree: 'bear' }, child);
      const res = { type: 'Object', props: { tree: 'bear', children: child } };
      assert.deepEqual(src, res);
    })

  });

  describe('Root.render()', () => {

    it('should ')
  })


});
