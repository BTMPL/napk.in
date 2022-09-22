import * as openpgp from "openpgp";
import { v4 } from "uuid";
import { Store } from "./store";

export async function decryptPayload(encrypted: string, password: string) {
  const binaryData = new Uint8Array(
    encrypted.split(",").map((v) => parseInt(v))
  );

  const encryptedMessage = await openpgp.readMessage({
    binaryMessage: binaryData,
  });

  const result = await openpgp.decrypt({
    message: encryptedMessage,
    passwords: [password],
    format: "binary",
  });

  if (result.data) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(result.data as Uint8Array);
  }

  return null;
}

export async function encryptPayload(data: Store, password: string) {
  const encoder = new TextEncoder();
  const binaryData = encoder.encode(JSON.stringify(data));

  const message = await openpgp.createMessage({ binary: binaryData });

  const result = await openpgp.encrypt({
    message,
    passwords: [password],
    format: "binary",
  });

  return result.toString();
}

export function generateSalt() {
  return v4();
}
