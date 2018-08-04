import ts from 'typescript';
import { GlobalProperty } from '../../constants';
import { ScriptBuilder } from '../../sb';
import { VisitOptions } from '../../types';

export enum SerializableType {
  Array = 7,
}

const invokeGlobal = (sb: ScriptBuilder, node: ts.Node, options: VisitOptions, property: GlobalProperty) => {
  // [1, val]
  sb.emitPushInt(node, 1);
  // [argsarr]
  sb.emitOp(node, 'PACK');
  // [val, argsarr]
  sb.emitHelper(node, options, sb.helpers.getGlobalProperty({ property }));
  // [val]
  sb.emitHelper(node, options, sb.helpers.invokeCall());
};

export const invokeSerialize = (sb: ScriptBuilder, node: ts.Node, options: VisitOptions) =>
  invokeGlobal(sb, node, options, GlobalProperty.GenericSerialize);

export const invokeDeserialize = (sb: ScriptBuilder, node: ts.Node, options: VisitOptions) =>
  invokeGlobal(sb, node, options, GlobalProperty.GenericDeserialize);

export const serializeType = (sb: ScriptBuilder, node: ts.Node, _options: VisitOptions, type: SerializableType) => {
  // [type, arr]
  sb.emitPushInt(node, type);
  // [2, type, arr]
  sb.emitPushInt(node, 2);
  // [arr]
  sb.emitOp(node, 'PACK');
};

export const deserializeType = (sb: ScriptBuilder, node: ts.Node, _options: VisitOptions) => {
  // [1, arr]
  sb.emitPushInt(node, 1);
  // [value]
  sb.emitOp(node, 'PICKITEM');
};

const isSerializedType = (sb: ScriptBuilder, node: ts.Node, _options: VisitOptions, type: SerializableType) => {
  // [0, val]
  sb.emitPushInt(node, 0);
  // [type]
  sb.emitOp(node, 'PICKITEM');
  // [type, type]
  sb.emitPushInt(node, type);
  // [isSerializedType]
  sb.emitOp(node, 'NUMEQUAL');
};

export const getTypes = (sb: ScriptBuilder, node: ts.Node, options: VisitOptions) => [
  {
    isRuntimeType: () => {
      // [isNullOrUndefined]
      sb.emitHelper(node, options, sb.helpers.isNullOrUndefined);
    },
    serialize: () => {
      // do nothing
    },
    isSerializedType: () => {
      // [isNullOrUndefined]
      sb.emitHelper(node, options, sb.helpers.isNullOrUndefined);
    },
    deserialize: () => {
      // do nothing
    },
  },
  {
    isRuntimeType: () => {
      // [isBoolean]
      sb.emitHelper(node, options, sb.helpers.isBoolean);
    },
    serialize: () => {
      // do nothing
    },
    isSerializedType: () => {
      // [isBoolean]
      sb.emitHelper(node, options, sb.helpers.isBoolean);
    },
    deserialize: () => {
      // do nothing
    },
  },
  {
    isRuntimeType: () => {
      // [isString]
      sb.emitHelper(node, options, sb.helpers.isString);
    },
    serialize: () => {
      // do nothing
    },
    isSerializedType: () => {
      // [isString]
      sb.emitHelper(node, options, sb.helpers.isString);
    },
    deserialize: () => {
      // do nothing
    },
  },
  {
    isRuntimeType: () => {
      // [isNumber]
      sb.emitHelper(node, options, sb.helpers.isNumber);
    },
    serialize: () => {
      // do nothing
    },
    isSerializedType: () => {
      // [isNumber]
      sb.emitHelper(node, options, sb.helpers.isNumber);
    },
    deserialize: () => {
      // do nothing
    },
  },
  {
    isRuntimeType: () => {
      // [isSymbol]
      sb.emitHelper(node, options, sb.helpers.isSymbol);
    },
    serialize: () => {
      // do nothing
    },
    isSerializedType: () => {
      // [isSymbol]
      sb.emitHelper(node, options, sb.helpers.isSymbol);
    },
    deserialize: () => {
      // do nothing
    },
  },
  {
    isRuntimeType: () => {
      // [boolean]
      sb.emitHelper(node, options, sb.helpers.isArray);
    },
    serialize: () => {
      // [arr]
      sb.emitHelper(node, options, sb.helpers.unwrapArray);
      // [arr]
      sb.emitHelper(
        node,
        options,
        sb.helpers.arrMap({
          map: () => {
            invokeSerialize(sb, node, options);
          },
        }),
      );
      // [value]
      serializeType(sb, node, options, SerializableType.Array);
    },
    isSerializedType: () => {
      isSerializedType(sb, node, options, SerializableType.Array);
    },
    deserialize: () => {
      // [arr]
      deserializeType(sb, node, options);
      // [arr]
      sb.emitHelper(
        node,
        options,
        sb.helpers.arrMap({
          map: () => {
            invokeDeserialize(sb, node, options);
          },
        }),
      );
      // [val]
      sb.emitHelper(node, options, sb.helpers.wrapArray);
    },
  },
  {
    isRuntimeType: () => {
      sb.emitHelper(node, options, sb.helpers.isBuffer);
    },
    serialize: () => {
      // do nothing
    },
    isSerializedType: () => {
      sb.emitHelper(node, options, sb.helpers.isBuffer);
    },
    deserialize: () => {
      // do nothing
    },
  },
];
