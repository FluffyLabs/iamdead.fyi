/* tslint:disable */
/* eslint-disable */
/**
* Split given `key` into SSS chunks according to `configuration`.
*
* The `key` should be raw, 32-bytes key. The magic sequence and version
* will be prepended internally.
* @param {Uint8Array} key
* @param {ChunksConfiguration} configuration
* @returns {any[]}
*/
export function split_into_chunks(key: Uint8Array, configuration: ChunksConfiguration): any[];
/**
* Recover key given enough SSS chunks.
*
* The recovered key will be byte-encoded, i.e. it will
* be prepended with magic sequence and version information.
* @param {any[]} chunks
* @returns {Uint8Array}
*/
export function recover_key(chunks: any[]): Uint8Array;
/**
* Secure given message by randomly selecting an encryption key,
* encrypting the message and splitting the key using Shamir Secret Sharing
* scheme with given configuration.
*
* The resulting encrypted message may also be split into multiple parts
* using `split` parameter to make sure it can fit into QR codes.
* @param {string} msg
* @param {number | undefined} split
* @param {ChunksConfiguration} chunks_configuration
* @returns {any}
*/
export function secure_message(msg: string, split: number | undefined, chunks_configuration: ChunksConfiguration): any;
/**
* Restore the original message given parts of the encrypted message and SSS chunks.
* @param {any[]} message
* @param {any[]} chunks
* @returns {string}
*/
export function restore_message(message: any[], chunks: any[]): string;
/**
* Encrypt given `message` using provided `key`.
*
* The `key` must be a vector containing exactly
* [KEY_SIZE] bytes (32-bytes for V0).
*
* The result will be a vector of string `JsValue`s, each
* containing an encoded part of encrypted message, no
* longer than given `split` value.
*
* If `None` for `split` is provided, the result will be single
* `JsValue` string, containing the entire encrypted message.
* @param {Uint8Array} key
* @param {string} message
* @param {number | undefined} split
* @returns {any[]}
*/
export function encrypt_message(key: Uint8Array, message: string, split?: number): any[];
/**
* Decrypt given `data` using provided `key`.
*
* - `key` must be exactly [KEY_SIZE] bytes (32-bytes for V0).
* - `data` is arbitrary length encrypted message.
* - `nonce` must be exactly [NONCE_SIZE] bytes (12-bytes).
*
* The result will be the decrypted message as a string `JsValue`.
* @param {Uint8Array} key
* @param {any[]} message_parts
* @returns {string}
*/
export function decrypt_message(key: Uint8Array, message_parts: any[]): string;
/**
* WASM-compatible SSS chunks configuration.
*/
export class ChunksConfiguration {
  free(): void;
/**
* Create new [ChunksConfiguration].
* @param {number} required
* @param {number} spare
*/
  constructor(required: number, spare: number);
/**
* Number of chunks required for recovery.
*/
  required: number;
/**
* Number of extra chunks.
*/
  spare: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_chunksconfiguration_free: (a: number) => void;
  readonly __wbg_get_chunksconfiguration_required: (a: number) => number;
  readonly __wbg_set_chunksconfiguration_required: (a: number, b: number) => void;
  readonly __wbg_get_chunksconfiguration_spare: (a: number) => number;
  readonly __wbg_set_chunksconfiguration_spare: (a: number, b: number) => void;
  readonly chunksconfiguration_new: (a: number, b: number) => number;
  readonly split_into_chunks: (a: number, b: number, c: number, d: number) => void;
  readonly recover_key: (a: number, b: number, c: number) => void;
  readonly secure_message: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly restore_message: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly encrypt_message: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly decrypt_message: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
