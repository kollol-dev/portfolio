import path from "node:path";

/** Data-folder locations, shared by the content store and the proxy. */
export const dataDir = () => path.resolve(process.env.CONTENT_DATA_DIR || path.join(process.cwd(), ".data"));
export const blogFile = () => path.join(dataDir(), "blog.json");
export const blogSeedFile = () => path.join(process.cwd(), "content", "blog.json");
