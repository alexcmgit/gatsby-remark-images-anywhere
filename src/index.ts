import path from 'path';
import { selectAll } from 'unist-util-select';
import slash from 'slash';

import { RemarkLiteral, Args, Options, RemarkNode } from './type';
import { downloadImage, processImage } from './util-download-image';
import { RemarkImageNode, toMdNode } from './util-html-to-md';
import { defaultMarkup } from './default-markup';
import { isWhitelisted } from './relative-protocol-whitelist';
import { SUPPORT_EXTS } from './constants';
import {
  buildRequestHttpHeadersWith,
} from './custom-http-headers/http-header-trusted-provider';
import { resolveFullUrl, resolveRelativeUrl } from 'utils';

export default async function remarkImagesAnywhere(
  {
    markdownAST: mdast,
    markdownNode,
    actions,
    store,
    files,
    getNode,
    getCache,
    createNodeId,
    reporter,
    cache,
    pathPrefix,
  }: Args,
  pluginOptions: Options
) {
  const {
    plugins,
    staticDir = 'static',
    createMarkup = defaultMarkup,
    sharpMethod = 'fluid',

    // markup options
    loading = 'lazy',
    linkImagesToOriginal = false,
    showCaptions = false,
    wrapperStyle = '',
    backgroundColor = '#fff',
    tracedSVG = false,
    blurUp = true,

    // image http request options
    dangerouslyBuildRequestHttpHeaders,
    httpHeaderProviders = [],

    ...imageOptions
  } = pluginOptions;

  if (['fluid', 'fixed', 'resize'].indexOf(sharpMethod) < 0) {
    reporter.panic(
      `'sharpMethod' only accepts 'fluid', 'fixed' or 'resize', got ${sharpMethod} instead.`
    );
  }

  const { touchNode, createNode } = actions;

  // gatsby parent file node of this markdown node
  const dirPath =
    markdownNode.parent && (getNode(markdownNode.parent)?.dir as string);
  const { directory } = store.getState().program;

  const imgNodes: RemarkImageNode[] = selectAll('image[url]', mdast).filter(
    (node): node is RemarkImageNode => 'src' in node
  );
  const htmlImgNodes: RemarkImageNode[] = selectAll('html, jsx', mdast)
    .filter((node: RemarkNode): node is RemarkLiteral => 'value' in node)
    .map((node: RemarkLiteral, _, __) => toMdNode(node))
    .filter(
      (node: RemarkImageNode | null, _, __): node is RemarkImageNode => !!node
    );

  imgNodes.push(...htmlImgNodes);
  const processPromises = imgNodes.map(async (node) => {
    if (!node.url) return;

    let url = node.url;

    let gImgFileNode;

    // handle relative protocol domains, i.e from contentful
    // append these url with https
    if (isWhitelisted(url)) {
      url = `https:${url}`;
    }

    const remoteFullImageUrl = resolveFullUrl(url);
    const relativeImageUrl = resolveRelativeUrl(url);

    if (remoteFullImageUrl) {
      const buildRequestHttpHeaders =
        dangerouslyBuildRequestHttpHeaders ??
        buildRequestHttpHeadersWith(httpHeaderProviders);

      // handle remote path
      gImgFileNode = await downloadImage({
        id: markdownNode.id,
        url: new URL(url).protocol,
        getCache,
        getNode,
        touchNode,
        cache,
        createNode,
        createNodeId,
        reporter,
        dangerouslyBuildImageRequestHttpHeaders: buildRequestHttpHeaders,
      });
    } else if (relativeImageUrl) {
			// ==============================
			// TODO(@libsrcdev): REFACTOR THIS TO MOUNT MORE FLEXIBLE URLS INSTEAD OF USING [staticDir]
			// ==============================
			
      let filePath: string;
      if (dirPath && url[0] === '.') {
        // handle relative path (./image.png, ../image.png)
        filePath = slash(path.join(dirPath, url));
      } else {
        // handle path returned from netlifyCMS & friends (/assets/image.png)
        filePath = path.join(directory, staticDir, url);
      }

      gImgFileNode = files.find(
        (fileNode) =>
          fileNode.absolutePath && fileNode.absolutePath === filePath
      );
    } else {
      // We can't handle this URL
      reporter.warn(`Skipping invalid image URL ${url}`);
    }
    if (!gImgFileNode) return;
    if (!SUPPORT_EXTS.includes(gImgFileNode.extension)) return;

    const imageResult = await processImage({
      file: gImgFileNode,
      reporter,
      cache,
      pathPrefix,
      sharpMethod,
      imageOptions,
    });
    if (!imageResult) return;

    // mutate node
    const data = {
      title: node.title,
      alt: node.alt,
      originSrc: node.url,
      sharpMethod,
      ...imageResult,
    };
    node.type = 'html';
    node.value = createMarkup(data, {
      loading,
      linkImagesToOriginal,
      showCaptions,
      wrapperStyle,
      backgroundColor,
      tracedSVG,
      blurUp,
    });

    return null;
  });

  return Promise.all(processPromises);
}
