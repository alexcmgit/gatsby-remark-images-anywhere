import { createRemoteFileNode } from 'gatsby-source-filesystem';
import sharp from 'gatsby-plugin-sharp';

import { SharpResult, SharpMethod } from './type';

export const downloadImage = async ({
  id,
  url,
  getCache,
  getNode,
  touchNode,
  cache,
  createNode,
  createNodeId,
  reporter,
  dangerouslyBuildImageRequestHttpHeaders,
}: any) => {
  let imageFileNode;
  const mediaDataCacheKey = `gria-${url}`;
  const cacheMediaData = await cache.get(mediaDataCacheKey);

  if (cacheMediaData && cacheMediaData.fileNodeId) {
    const fileNodeId = cacheMediaData.fileNodeId;
    const fileNode = getNode(fileNodeId);

    if (fileNode) {
      touchNode({
        nodeId: fileNodeId,
      });
      reporter.verbose(`[gria] Using cached image for: ${url}`);
      imageFileNode = fileNode;
    }
  }

  if (!imageFileNode) {
    try {
      const imageUrl = process.env.LOW_WIFI_MODE
        ? 'https://placekitten.com/1200/800'
        : url;
      const fileNode = await createRemoteFileNode({
        url: imageUrl,
        getCache,
        cache,
        createNode,
        createNodeId,
        parentNodeId: id,
        httpHeaders: dangerouslyBuildImageRequestHttpHeaders(imageUrl),
      });

      if (fileNode) {
        imageFileNode = fileNode;
        reporter.verbose(`[gria] Downloaded and cached remote image: ${url}`);
        await cache.set(mediaDataCacheKey, {
          fileNodeId: fileNode.id,
        });
      }
    } catch (e) {
      reporter.warn(`[gria] Failed to download ${url}: ${e}`);
    }
  }

  return imageFileNode;
};

export const processImage = async ({
  file,
  reporter,
  cache,
  pathPrefix,
  sharpMethod,
  imageOptions,
}: {
  sharpMethod: SharpMethod;
} & { [key: string]: any }): Promise<SharpResult> => {
  const args = {
    pathPrefix,
    ...imageOptions,
  };
  const getImage = sharp[sharpMethod];

  return getImage({
    file,
    args,
    reporter,
    cache,
  });
};
