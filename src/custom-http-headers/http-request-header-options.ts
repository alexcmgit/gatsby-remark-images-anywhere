export type HttpRequestHeaderOptions = {
  dangerouslyBuildRequestHttpHeaders?: (
    url: string
  ) => Record<string, string> | undefined;
  httpHeaderProviders?: HttpRequestHeaderProvider[];
};

export type HttpRequestHeaderProvider = (
  url: string
) => Record<string, string> | undefined;
