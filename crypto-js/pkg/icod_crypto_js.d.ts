/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} key
* @param {ChunksConfiguration} configuration
* @returns {any[]}
*/
export function split_into_chunks(key: Uint8Array, configuration: ChunksConfiguration): any[];
/**
* @param {any[]} chunks
* @returns {Uint8Array}
*/
export function recover_key(chunks: any[]): Uint8Array;
/**
* @param {string} msg
* @param {ChunksConfiguration} chunks_configuration
* @returns {any}
*/
export function secure_message(msg: string, chunks_configuration: ChunksConfiguration): any;
/**
* @param {Uint8Array} data
* @param {Uint8Array} nonce
* @param {any[]} chunks
* @returns {Uint8Array}
*/
export function restore_message(data: Uint8Array, nonce: Uint8Array, chunks: any[]): Uint8Array;
/**
* @param {Uint8Array} key
* @param {string} msg
* @returns {any}
*/
export function encrypt_message(key: Uint8Array, msg: string): any;
/**
* @param {Uint8Array} key
* @param {Uint8Array} data
* @param {Uint8Array} nonce
* @returns {Uint8Array}
*/
export function decrypt_message(key: Uint8Array, data: Uint8Array, nonce: Uint8Array): Uint8Array;
/**
*/
export enum SplittingError {
  InvalidKeySize = 0,
  ConfigurationError = 1,
}
/**
*/
export enum RecoveryError {
  ChunkDecodingError = 0,
  InconsistentChunks = 1,
  InconsistentConfiguration = 2,
  NotEnoughChunks = 3,
  UnexpectedKey = 4,
  KeyDecodingError = 5,
}
/**
*/
export enum Error {
  InvalidKeySize = 0,
  InvalidNonceSize = 1,
  VersionError = 2,
  CryptoError = 3,
}
/**
*/
export class ChunksConfiguration {
  free(): void;
/**
* @param {number} required
* @param {number} spare
*/
  constructor(required: number, spare: number);
/**
*/
  required: number;
/**
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
  readonly secure_message: (a: number, b: number, c: number, d: number) => void;
  readonly restore_message: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly encrypt_message: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly decrypt_message: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
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
