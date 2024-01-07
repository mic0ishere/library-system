import { customAlphabet } from "nanoid";
export const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
);

const prefixes = {
  book: "book",
  user: "user",
};

export function newId(prefix) {
  if (!prefixes[prefix]) throw new Error(`Prefix ${prefix} is not defined`);
  return [prefixes[prefix], nanoid(16)].join("_");
}
