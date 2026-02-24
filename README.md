# gatsby-remark-structured-content

This plugin processes images from markdown files that are parsed with [`gatsby-transformer-remark`](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/). It supports images from multiple sources including relative paths, remote URLs, protocol-relative URLs, and CMS-generated paths.

## Fork Notice

This is a fork of [gatsby-remark-images-anywhere](https://github.com/d4rekanguok/gatsby-remark-images-anywhere) with the following improvements:

- Updated dependencies to latest versions
- Added support for custom HTTP headers in image requests (useful for authenticated image sources)
- Enhanced URL validation and security features

## Why use this?

`gatsby-remark-images` is great, but if you use a CMS that pastes remote URLs or paths that aren't relative to the markdown file itself, it won't work. This plugin provides a more flexible solution that:

- Takes any image path (relative, absolute, remote, protocol-relative) and feeds them to Sharp
- Allows customized Sharp methods (`fluid`, `fixed`, `resize`)
- Supports custom image templates
- Works with NetlifyCMS and other headless CMS platforms
- Extracts images based on custom logic for thumbnails or galleries

## Supported image paths

```markdown
# Regular relative path
![relative path](./image.png)

# NetlifyCMS path (absolute from root)
![relative from root path](/assets/image.png)

# Remote path
![cloud image](https://images.unsplash.com/photo-1563377176922-062e6ae09ceb)

# Protocol relative path
![cloud image](//images.ctfassets.net/1311eqff/image.png)

# Also works with <img /> tags
<img src="./image.png" alt="hey" title="hello" />
```

### Protocol relative paths
See the whitelisted domains [here](./src/relative-protocol-whitelist.ts)

## How to install

```sh
npm i --save @libsrcdev/gatsby-remark-structured-content
```

### Requirements
Your project needs to have:
- gatsby
- gatsby-source-filesystem
- gatsby-transformer-remark
- gatsby-transformer-sharp
- gatsby-plugin-sharp

## Capabilities

- List embedded images of markdown content based on custom logic
- Remove embedded images of markdown content based on custom logic
- Process images from any source (local, remote, CMS)
- Generate optimized Sharp images with custom configurations

## Use cases

- Extract the first embedded image to use it as a thumbnail
- Create a gallery of all images used in a post
- Process remote images from a headless CMS
- Handle NetlifyCMS absolute paths

## Usage

Basic example:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-structured-content`,
          options: {
            // Optional: provide a function to extract images based on custom logic
            shouldExtractImage: async (code) => { ... },
          },
        },
      ],
    },
  },
];
```

## Configuration

Full configuration options:

```js
{
  resolve: `gatsby-remark-structured-content`,
  options: {
    /**
     * @param {string} staticDir
     * Root folder for images. For example,
     * if your image path is `/assets/image.png`,
     * your image is located in `static/assets/image.png`,
     * then the staticDir is `static`.
     */
    staticDir: 'static',

    /**
     * @param {Function} createMarkup
     * A function that returns string template for image
     * All sharp result will be passed in as arguments
     */
    createMarkup: ({ src, srcSet }) => `<img src="${src}" srcSet="${srcSet}" class="custom-class" />`,

    /**
     * @param {'lazy' | 'eager' | 'auto'} loading 
     * Set the output markup's 'loading' attribute. Default: 'lazy'
     */
    loading: 'lazy',

    /**
     * @param {string} backgroundColor
     * Background color. Default: '#fff'
     */
    backgroundColor: '#fff',

    /**
     * @param {boolean} linkImagesToOriginal 
     * If enabled, wraps the default markup with an <a> tag pointing to the original image.
     * Default: false
     */
    linkImagesToOriginal: true,

    /**
     * @param {string | Function} wrapperStyle 
     * Inject styles to the image wrapper.
     * Also accepts a function that receives all image data as arguments:
     * ({ aspectRatio, width, height }) => `padding-bottom: ${height/2}px;`
     */
    wrapperStyle: 'padding-bottom: 0.5rem;',

    /**
     * @param {'fluid' | 'fixed' | 'resize'} sharpMethod
     * Default: 'fluid'.
     */
    sharpMethod: 'fluid',

    /**
     * Sharp image options
     * Any sharp image arguments (quality, maxWidth, etc.)
     */
    maxWidth: 650,
    quality: 50,
  }
}
```

## Writing your own markup

You can customize the image markup using the `createMarkup` function:

```ts
type CreateMarkup = (args: CreateMarkupArgs, options?: MarkupOptions) => string;

interface CreateMarkupArgs {
  sharpMethod: SharpMethod;
  originSrc: string;
  title?: string;
  alt?: string;

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

interface MarkupOptions {
  loading: 'lazy' | 'eager' | 'auto';
  linkImagesToOriginal: boolean;
  showCaptions: boolean;
  wrapperStyle: string | Function;
  backgroundColor: string;
  tracedSVG: boolean | Object;
  blurUp: boolean;
}
```

## Example

[Codesandbox demo](https://codesandbox.io/s/gatsby-remark-images-anywhere-remark-custom-component-lazy-load-007vo) showing this plugin combined with [`gatsby-transformer-remark` custom components](https://using-remark.gatsbyjs.org/custom-components/) to achieve `gatsby-image`-like benefits (blur up, lazy loading, aspect-ratio).

## Should I use this?

- If you don't use remote images or a CMS, use [`gatsby-remark-images`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-images)
- If you're using vanilla NetlifyCMS, use [`gatsby-remark-relative-images`](https://github.com/danielmahon/gatsby-remark-relative-images)
- If you need remote images or more flexibility, try this plugin!
