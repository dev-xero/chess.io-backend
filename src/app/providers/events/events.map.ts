type EvMapParams = {
  [K in keyof typeof registry]: Record<string, string>;
};
