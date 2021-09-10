import { toString, Record } from "../../examples/JsConsoleExample/.fable/fable-library.3.2.12/Types.js";
import { record_type, tuple_type, bool_type, list_type, obj_type, class_type, option_type, lambda_type, string_type, unit_type, enum_type, int32_type } from "../../examples/JsConsoleExample/.fable/fable-library.3.2.12/Reflection.js";
import { singleton, append, toArray, map as map_1, iterate, reverse, empty } from "../../examples/JsConsoleExample/.fable/fable-library.3.2.12/List.js";
import { copyTo, fill } from "../../examples/JsConsoleExample/.fable/fable-library.3.2.12/Array.js";
import { Lazy, comparePrimitives, max } from "../../examples/JsConsoleExample/.fable/fable-library.3.2.12/Util.js";
import { tryFind, map, delay, toList } from "../../examples/JsConsoleExample/.fable/fable-library.3.2.12/Seq.js";
import { map as map_2, ofNullable } from "../../examples/JsConsoleExample/.fable/fable-library.3.2.12/Option.js";

export class Types_Log extends Record {
    constructor(LogLevel, Message, Exception, Parameters, AdditionalNamedParameters) {
        super();
        this.LogLevel = (LogLevel | 0);
        this.Message = Message;
        this.Exception = Exception;
        this.Parameters = Parameters;
        this.AdditionalNamedParameters = AdditionalNamedParameters;
    }
}

export function Types_Log$reflection() {
    return record_type("FsLibLog.Types.Log", [], Types_Log, () => [["LogLevel", enum_type("FsLibLog.Types.LogLevel", int32_type, [["Trace", 0], ["Debug", 1], ["Info", 2], ["Warn", 3], ["Error", 4], ["Fatal", 5]])], ["Message", option_type(lambda_type(unit_type, string_type))], ["Exception", option_type(class_type("System.Exception"))], ["Parameters", list_type(obj_type)], ["AdditionalNamedParameters", list_type(tuple_type(string_type, obj_type, bool_type))]]);
}

export function Types_Log_StartLogLevel_1102662A(logLevel) {
    return new Types_Log(logLevel, void 0, void 0, empty(), empty());
}

export class Types_Stack$1 {
    constructor(n) {
        this.contents = fill(new Array(n), 0, n, null);
        this.count = 0;
    }
}

export function Types_Stack$1$reflection(gen0) {
    return class_type("FsLibLog.Types.Stack`1", [gen0], Types_Stack$1);
}

export function Types_Stack$1_$ctor_Z524259A4(n) {
    return new Types_Stack$1(n);
}

export function Types_Stack$1__Ensure_Z524259A4(buf, newSize) {
    const oldSize = buf.contents.length | 0;
    if (newSize > oldSize) {
        const old = buf.contents;
        buf.contents = fill(new Array(max((x, y) => comparePrimitives(x, y), newSize, oldSize * 2)), 0, max((x, y) => comparePrimitives(x, y), newSize, oldSize * 2), null);
        copyTo(old, 0, buf.contents, 0, buf.count);
    }
}

export function Types_Stack$1__get_Count(buf) {
    return buf.count;
}

export function Types_Stack$1__Pop(buf) {
    const item = buf.contents[buf.count - 1];
    buf.count = ((buf.count - 1) | 0);
    return item;
}

export function Types_Stack$1__Peep(buf) {
    return buf.contents[buf.count - 1];
}

export function Types_Stack$1__Top_Z524259A4(buf, n) {
    return reverse(toList(delay(() => map((x) => x, buf.contents.slice(max((x_1, y) => comparePrimitives(x_1, y), 0, buf.count - n), (buf.count - 1) + 1)))));
}

export function Types_Stack$1__Push_2B595(buf, x) {
    Types_Stack$1__Ensure_Z524259A4(buf, buf.count + 1);
    buf.contents[buf.count] = x;
    buf.count = ((buf.count + 1) | 0);
}

export function Types_Stack$1__get_IsEmpty(buf) {
    return buf.count === 0;
}

export class Types_Inner_DisposableStack {
    constructor() {
        this.stack = Types_Stack$1_$ctor_Z524259A4(2);
    }
    Dispose() {
        const __ = this;
        while (Types_Stack$1__get_Count(__.stack) > 0) {
            Types_Stack$1__Pop(__.stack).Dispose();
        }
    }
}

export function Types_Inner_DisposableStack$reflection() {
    return class_type("FsLibLog.Types.Inner.DisposableStack", void 0, Types_Inner_DisposableStack);
}

export function Types_Inner_DisposableStack_$ctor() {
    return new Types_Inner_DisposableStack();
}

export function Types_Inner_DisposableStack__Push_Z5A296901(__, item) {
    Types_Stack$1__Push_2B595(__.stack, item);
}

export function Types_Inner_DisposableStack__Push_AE3F655(__, items) {
    iterate((arg00) => {
        Types_Stack$1__Push_2B595(__.stack, arg00);
    }, items);
}

export function Types_Inner_DisposableStack_Create_AE3F655(items) {
    const ds = Types_Inner_DisposableStack_$ctor();
    Types_Inner_DisposableStack__Push_AE3F655(ds, items);
    return ds;
}

export function FsLibLog_Types_ILog__ILog_fromLog_Z4A2DCA04(logger, log) {
    const __ = Types_Inner_DisposableStack_Create_AE3F655(map_1((tupledArg) => logger.MappedContext(tupledArg[0], tupledArg[1], tupledArg[2]), log.AdditionalNamedParameters));
    try {
        return logger.Log(log.LogLevel, log.Message, log.Exception, toArray(log.Parameters));
    }
    finally {
        __.Dispose();
    }
}

export function FsLibLog_Types_ILog__ILog_fatal$0027_40D5F1D6(logger, logConfig) {
    return FsLibLog_Types_ILog__ILog_fromLog_Z4A2DCA04(logger, logConfig(Types_Log_StartLogLevel_1102662A(5)));
}

export function FsLibLog_Types_ILog__ILog_fatal_40D5F1D6(logger, logConfig) {
    void FsLibLog_Types_ILog__ILog_fatal$0027_40D5F1D6(logger, logConfig);
}

export function FsLibLog_Types_ILog__ILog_error$0027_40D5F1D6(logger, logConfig) {
    return FsLibLog_Types_ILog__ILog_fromLog_Z4A2DCA04(logger, logConfig(Types_Log_StartLogLevel_1102662A(4)));
}

export function FsLibLog_Types_ILog__ILog_error_40D5F1D6(logger, logConfig) {
    void FsLibLog_Types_ILog__ILog_error$0027_40D5F1D6(logger, logConfig);
}

export function FsLibLog_Types_ILog__ILog_warn$0027_40D5F1D6(logger, logConfig) {
    return FsLibLog_Types_ILog__ILog_fromLog_Z4A2DCA04(logger, logConfig(Types_Log_StartLogLevel_1102662A(3)));
}

export function FsLibLog_Types_ILog__ILog_warn_40D5F1D6(logger, logConfig) {
    void FsLibLog_Types_ILog__ILog_warn$0027_40D5F1D6(logger, logConfig);
}

export function FsLibLog_Types_ILog__ILog_info$0027_40D5F1D6(logger, logConfig) {
    return FsLibLog_Types_ILog__ILog_fromLog_Z4A2DCA04(logger, logConfig(Types_Log_StartLogLevel_1102662A(2)));
}

export function FsLibLog_Types_ILog__ILog_info_40D5F1D6(logger, logConfig) {
    void FsLibLog_Types_ILog__ILog_info$0027_40D5F1D6(logger, logConfig);
}

export function FsLibLog_Types_ILog__ILog_debug$0027_40D5F1D6(logger, logConfig) {
    return FsLibLog_Types_ILog__ILog_fromLog_Z4A2DCA04(logger, logConfig(Types_Log_StartLogLevel_1102662A(1)));
}

export function FsLibLog_Types_ILog__ILog_debug_40D5F1D6(logger, logConfig) {
    void FsLibLog_Types_ILog__ILog_debug$0027_40D5F1D6(logger, logConfig);
}

export function FsLibLog_Types_ILog__ILog_trace$0027_40D5F1D6(logger, logConfig) {
    return FsLibLog_Types_ILog__ILog_fromLog_Z4A2DCA04(logger, logConfig(Types_Log_StartLogLevel_1102662A(0)));
}

export function FsLibLog_Types_ILog__ILog_trace_40D5F1D6(logger, logConfig) {
    void FsLibLog_Types_ILog__ILog_trace$0027_40D5F1D6(logger, logConfig);
}

export function Types_LogModule_setMessage(message, log) {
    return new Types_Log(log.LogLevel, () => message, log.Exception, log.Parameters, log.AdditionalNamedParameters);
}

export function Types_LogModule_setMessageThunk(messageThunk, log) {
    return new Types_Log(log.LogLevel, messageThunk, log.Exception, log.Parameters, log.AdditionalNamedParameters);
}

export function Types_LogModule_addParameter(param, log) {
    return new Types_Log(log.LogLevel, log.Message, log.Exception, append(log.Parameters, singleton(param)), log.AdditionalNamedParameters);
}

export function Types_LogModule_addParameters(params, log) {
    return new Types_Log(log.LogLevel, log.Message, log.Exception, append(log.Parameters, map_1((value) => value, params)), log.AdditionalNamedParameters);
}

export function Types_LogModule_addContext(key, value, log) {
    return new Types_Log(log.LogLevel, log.Message, log.Exception, log.Parameters, append(log.AdditionalNamedParameters, singleton([key, value, false])));
}

export function Types_LogModule_addContextDestructured(key, value, log) {
    return new Types_Log(log.LogLevel, log.Message, log.Exception, log.Parameters, append(log.AdditionalNamedParameters, singleton([key, value, true])));
}

export function Types_LogModule_addException(exception, log) {
    return new Types_Log(log.LogLevel, log.Message, ofNullable(exception), log.Parameters, log.AdditionalNamedParameters);
}

export function Types_LogModule_addExn(exception, log) {
    return Types_LogModule_addException(exception, log);
}

export function Types_LogModule_setLogLevel(logLevel, log) {
    return new Types_Log(logLevel, log.Message, log.Exception, log.Parameters, log.AdditionalNamedParameters);
}

export function Operators_op_BangBang(message) {
    return (log) => Types_LogModule_setMessage(message, log);
}

export function Operators_op_GreaterGreaterBang(log, value) {
    return (arg) => Types_LogModule_addParameter(value, log(arg));
}

export function Operators_op_GreaterGreaterBangMinus(log, key, value) {
    return (arg) => Types_LogModule_addContext(key, value, log(arg));
}

export function Operators_op_GreaterGreaterBangPlus(log, key, value) {
    return (arg) => Types_LogModule_addContextDestructured(key, value, log(arg));
}

export function Operators_op_GreaterGreaterBangBang(log, e) {
    return (arg) => Types_LogModule_addException(e, log(arg));
}

let LogProvider_currentLogProvider = void 0;

function LogProvider_knownProviders() {
    return empty();
}

const LogProvider_resolvedLogger = new Lazy(() => map_2((tupledArg_1) => tupledArg_1[1](), tryFind((tupledArg) => tupledArg[0](), LogProvider_knownProviders())));

function LogProvider_noopLogger() {
    return (_arg4, _arg3, _arg2, _arg1) => false;
}

const LogProvider_noopDisposable = {
    Dispose() {
    },
};

export function LogProvider_setLoggerProvider(logProvider) {
    LogProvider_currentLogProvider = logProvider;
}

export function LogProvider_getCurrentLogProvider() {
    if (LogProvider_currentLogProvider != null) {
        return LogProvider_currentLogProvider;
    }
    else {
        return LogProvider_resolvedLogger.Value;
    }
}

export function LogProvider_openMappedContextDestucturable(key, value, destructureObjects) {
    const provider = LogProvider_getCurrentLogProvider();
    if (provider == null) {
        return LogProvider_noopDisposable;
    }
    else {
        return provider.OpenMappedContext(key, value, destructureObjects);
    }
}

export const LogProvider_openMappedContextDestucturableFuncWrapper = (delegateArg0, delegateArg1, delegateArg2) => LogProvider_openMappedContextDestucturable(delegateArg0, delegateArg1, delegateArg2);

export function LogProvider_openMappedContext(key, value) {
    return LogProvider_openMappedContextDestucturable(key, value, false);
}

export function LogProvider_openNestedContext(value) {
    const provider = LogProvider_getCurrentLogProvider();
    if (provider == null) {
        return LogProvider_noopDisposable;
    }
    else {
        return provider.OpenNestedContext(value);
    }
}

export function LogProvider_getLoggerByName(name) {
    const loggerProvider = LogProvider_getCurrentLogProvider();
    const logFunc = (loggerProvider == null) ? LogProvider_noopLogger() : loggerProvider.GetLogger(name);
    return {
        Log: logFunc,
        MappedContext: LogProvider_openMappedContextDestucturableFuncWrapper,
    };
}

export function LogProvider_getLoggerByType(type) {
    return LogProvider_getLoggerByName(toString(type));
}

