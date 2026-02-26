import { parseFragment } from 'parse5';

import { RemarkLiteral } from './type';

export type RemarkImageNode = RemarkLiteral & {
  url?: string;
  title?: string;
  alt?: string;
  data: Record<string, any>;
};

export const toMdNode = (node: RemarkLiteral): RemarkImageNode | null => {
  const value = node.value;
  const parsed = parseFragment(value);
  const imgNode = parsed.childNodes.find((node) => {
    if ('tagName' in node) {
      return node.tagName === 'img';
    }
    return false;
  });

  // not an img? don't touch it
  if (!imgNode) return null;

  const attrs =
    'attrs' in imgNode
      ? imgNode.attrs.reduce((acc: Record<string, string>, cur) => {
          const { name, value } = cur;
          acc[name] = value;
          return acc;
        }, {})
      : {};

  // no src? don't touch it
  if (!('src' in attrs)) return null

  // store origin info & mutate node
  const original = { ...node };

  const remarkImageNode = node as RemarkImageNode;

  remarkImageNode.type = 'image';
  remarkImageNode.value = '';
  remarkImageNode.url = attrs.src;
  remarkImageNode.title = attrs.title;
  remarkImageNode.alt = attrs.alt;
  remarkImageNode.data = {
    original
  };

  return remarkImageNode;
};
