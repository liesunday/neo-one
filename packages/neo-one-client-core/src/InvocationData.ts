import BN from 'bn.js';
import { common, ECPoint, UInt160, UInt256 } from './common';
import {
  deserializeInvocationResultWireBase,
  InvocationResult,
} from './invocationResult';
import {
  createSerializeWire,
  DeserializeWireBaseOptions,
  DeserializeWireOptions,
  SerializableWire,
  SerializeWire,
} from './Serializable';
import { BinaryReader, BinaryWriter, IOHelper, utils } from './utils';

export interface InvocationDataAdd {
  hash: UInt256;
  assetHash?: UInt256 | null;
  contractHashes: UInt160[];
  deletedContractHashes: UInt160[];
  migratedContractHashes: Array<[UInt160, UInt160]>;
  voteUpdates: Array<[UInt160, ECPoint[]]>;
  blockIndex: number;
  transactionIndex: number;
  actionIndexStart: BN;
  actionIndexStop: BN;
  result: InvocationResult;
}

export interface InvocationDataKey {
  hash: UInt256;
}

export class InvocationData implements SerializableWire<InvocationData> {
  public static deserializeWireBase(
    options: DeserializeWireBaseOptions,
  ): InvocationData {
    const { reader } = options;
    const hash = reader.readUInt256();
    const assetHash = reader.readUInt256();
    const contractHashes = reader.readArray(() => reader.readUInt160());
    const deletedContractHashes = reader.readArray(() => reader.readUInt160());
    const migratedContractHashes = reader.readArray(() => {
      const from = reader.readUInt160();
      const to = reader.readUInt160();
      return [from, to] as [UInt160, UInt160];
    });
    const voteUpdates = reader.readArray(() => {
      const address = reader.readUInt160();
      const votes = reader.readArray(() => reader.readECPoint());
      return [address, votes] as [UInt160, ECPoint[]];
    });
    const blockIndex = reader.readUInt32LE();
    const transactionIndex = reader.readUInt32LE();
    const actionIndexStart = reader.readUInt64LE();
    const actionIndexStop = reader.readUInt64LE();
    const result = deserializeInvocationResultWireBase(options);
    return new this({
      hash,
      assetHash: common.uInt256Equal(assetHash, common.ZERO_UINT256)
        ? undefined
        : assetHash,
      contractHashes,
      deletedContractHashes,
      migratedContractHashes,
      voteUpdates,
      blockIndex,
      transactionIndex,
      actionIndexStart,
      actionIndexStop,
      result,
    });
  }

  public static deserializeWire(
    options: DeserializeWireOptions,
  ): InvocationData {
    return this.deserializeWireBase({
      context: options.context,
      reader: new BinaryReader(options.buffer),
    });
  }

  public readonly hash: UInt256;
  public readonly assetHash: UInt256 | null | undefined;
  public readonly contractHashes: UInt160[];
  public readonly deletedContractHashes: UInt160[];
  public readonly migratedContractHashes: Array<[UInt160, UInt160]>;
  public readonly voteUpdates: Array<[UInt160, ECPoint[]]>;
  public readonly blockIndex: number;
  public readonly transactionIndex: number;
  public readonly actionIndexStart: BN;
  public readonly actionIndexStop: BN;
  public readonly result: InvocationResult;
  public readonly serializeWire: SerializeWire = createSerializeWire(
    this.serializeWireBase.bind(this),
  );
  private readonly sizeInternal: () => number;

  constructor({
    hash,
    assetHash,
    contractHashes,
    deletedContractHashes,
    migratedContractHashes,
    voteUpdates,
    blockIndex,
    transactionIndex,
    actionIndexStart,
    actionIndexStop,
    result,
  }: InvocationDataAdd) {
    this.hash = hash;
    this.assetHash = assetHash;
    this.contractHashes = contractHashes;
    this.deletedContractHashes = deletedContractHashes;
    this.migratedContractHashes = migratedContractHashes;
    this.voteUpdates = voteUpdates;
    this.blockIndex = blockIndex;
    this.transactionIndex = transactionIndex;
    this.actionIndexStart = actionIndexStart;
    this.actionIndexStop = actionIndexStop;
    this.result = result;
    this.sizeInternal = utils.lazy(
      () =>
        IOHelper.sizeOfUInt256 +
        IOHelper.sizeOfUInt256 +
        IOHelper.sizeOfArray(
          this.contractHashes,
          () => IOHelper.sizeOfUInt160,
        ) +
        IOHelper.sizeOfArray(
          this.deletedContractHashes,
          () => IOHelper.sizeOfUInt160,
        ) +
        IOHelper.sizeOfArray(
          this.migratedContractHashes,
          () => IOHelper.sizeOfUInt160,
        ) +
        IOHelper.sizeOfArray(
          this.voteUpdates,
          (value) =>
            IOHelper.sizeOfUInt160 +
            IOHelper.sizeOfArray(value[1], (val) =>
              IOHelper.sizeOfECPoint(val),
            ),
        ) +
        IOHelper.sizeOfUInt32LE +
        IOHelper.sizeOfUInt32LE +
        IOHelper.sizeOfUInt64LE +
        IOHelper.sizeOfUInt64LE +
        this.result.size,
    );
  }

  public get size(): number {
    return this.sizeInternal();
  }

  public serializeWireBase(writer: BinaryWriter): void {
    writer.writeUInt256(this.hash);
    writer.writeUInt256(this.assetHash || common.ZERO_UINT256);
    writer.writeArray(this.contractHashes, (contractHash) => {
      writer.writeUInt160(contractHash);
    });
    writer.writeArray(this.deletedContractHashes, (contractHash) => {
      writer.writeUInt160(contractHash);
    });
    writer.writeArray(this.migratedContractHashes, ([from, to]) => {
      writer.writeUInt160(from);
      writer.writeUInt160(to);
    });
    writer.writeArray(this.voteUpdates, ([address, votes]) => {
      writer.writeUInt160(address);
      writer.writeArray(votes, (vote) => {
        writer.writeECPoint(vote);
      });
    });
    writer.writeUInt32LE(this.blockIndex);
    writer.writeUInt32LE(this.transactionIndex);
    writer.writeUInt64LE(this.actionIndexStart);
    writer.writeUInt64LE(this.actionIndexStop);
    this.result.serializeWireBase(writer);
  }
}
