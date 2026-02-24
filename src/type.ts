import { Node, NodePluginArgs } from 'gatsby';
import { FileSystemNode } from 'gatsby-source-filesystem';
import { HttpRequestHeaderOptions } from './custom-http-headers/http-request-header-options';

import type { Literal as RemarkLiteral } from 'mdast';
export type { Literal as RemarkLiteral } from 'mdast';

export type { Node as RemarkNode } from 'mdast';

export type SharpMethod = 'fluid' | 'fixed' | 'resize';

export interface Args extends NodePluginArgs {
  markdownAST: RemarkLiteral;
  markdownNode: Node;
  files: FileSystemNode[];
}

export interface SharpResult {
  aspectRatio: number;
  src: string;
  srcSet?: string;
  srcWebp?: string;
  srcSetWebp?: string;
  base64?: string;
  tracedSVG?: string;

  // fixed, resize
  width?: number;
  height?: number;

  // fluid
  presentationHeight?: number;
  presentationWidth?: number;
  sizes?: string;
  originalImg?: string;
}

export interface CreateMarkupArgs extends SharpResult {
  sharpMethod: SharpMethod;
  originSrc: string;
  title?: string;
  alt?: string;
}

export interface MarkupOptions {
  loading: 'lazy' | 'eager' | 'auto';
  linkImagesToOriginal: boolean;
  showCaptions: boolean;
  wrapperStyle: string | Function;
  backgroundColor: string;
  tracedSVG: boolean | Object;
  blurUp: boolean;
}

export type CreateMarkup = (
  args: CreateMarkupArgs,
  options?: MarkupOptions
) => string;

export interface Options
  extends Partial<MarkupOptions>, HttpRequestHeaderOptions {
  plugins: unknown[];
  staticDir?: string;
  createMarkup?: CreateMarkup;
  sharpMethod: SharpMethod;
  [key: string]: unknown;
}
