import { some } from "./.fable/fable-library.3.2.12/Option.js";
import { class_type } from "./.fable/fable-library.3.2.12/Reflection.js";
import { empty, head, tail, isEmpty, append, cons } from "./.fable/fable-library.3.2.12/List.js";
import { post, receive, start } from "./.fable/fable-library.3.2.12/MailboxProcessor.js";
import { singleton } from "./.fable/fable-library.3.2.12/AsyncBuilder.js";
import { format, replace, toText, printf, toConsole } from "./.fable/fable-library.3.2.12/String.js";
import { getEnumerator } from "./.fable/fable-library.3.2.12/Util.js";
import { toString } from "./.fable/fable-library.3.2.12/Types.js";
import { utcNow } from "./.fable/fable-library.3.2.12/Date.js";

export function JsLogging_logTrace(msg) {
    console.trace(some(msg));
}

export function JsLogging_logDebug(msg) {
    console.debug(msg);
}

export function JsLogging_logInfo(msg) {
    console.info(some(msg));
}

export function JsLogging_logWarn(msg) {
    console.warn(some(msg));
}

export function JsLogging_logError(msg) {
    console.error(some(msg));
}

export class Stack$1 {
    constructor(initial) {
        this.stack = initial;
    }
}

export function Stack$1$reflection(gen0) {
    return class_type("JsConsoleProvider.Stack`1", [gen0], Stack$1);
}

export function Stack$1_$ctor_Z38D79C61(initial) {
    return new Stack$1(initial);
}

export function Stack$1__Push_2B595(__, item) {
    __.stack = cons(item, __.stack);
}

export function Stack$1__Push_Z38D79C61(__, items) {
    __.stack = append(items, __.stack);
}

export function Stack$1__Pop(__) {
    const matchValue = __.stack;
    if (isEmpty(matchValue)) {
        throw (new Error("Empty stack cannot be popped."));
    }
    else {
        __.stack = tail(matchValue);
        return head(matchValue);
    }
}

export function Stack$1__Items(__) {
    return __.stack;
}

class ConsoleProvider {
    constructor() {
        this.propertyStack = Stack$1_$ctor_Z38D79C61(empty());
        this.threadSafeWriter = start((inbox) => {
            const loop = () => singleton.Delay(() => singleton.Bind(receive(inbox), (_arg1) => {
                const msg = _arg1[1];
                const level = _arg1[0] | 0;
                return singleton.Combine((level === 0) ? ((JsLogging_logTrace(msg), singleton.Zero())) : ((level === 1) ? ((JsLogging_logDebug(msg), singleton.Zero())) : ((level === 2) ? ((JsLogging_logInfo(msg), singleton.Zero())) : ((level === 3) ? ((JsLogging_logWarn(msg), singleton.Zero())) : ((level === 4) ? ((JsLogging_logError(msg), singleton.Zero())) : ((level === 5) ? ((JsLogging_logError(msg), singleton.Zero())) : ((toConsole(printf("Unhandled log level: %A"))(level), singleton.Zero()))))))), singleton.Delay(() => singleton.ReturnFrom(loop())));
            }));
            return loop();
        });
    }
    GetLogger(name) {
        const this$ = this;
        return (delegateArg0, delegateArg1, delegateArg2, delegateArg3) => ConsoleProvider__writeMessage(this$, name, delegateArg0, delegateArg1, delegateArg2, delegateArg3);
    }
    OpenMappedContext(key, value, destructure) {
        const this$ = this;
        return ConsoleProvider__addProp(this$, key, value);
    }
    OpenNestedContext(message) {
        const this$ = this;
        return ((value) => ConsoleProvider__addProp(this$, "NDC", value))(message);
    }
}

function ConsoleProvider$reflection() {
    return class_type("JsConsoleProvider.ConsoleProvider", void 0, ConsoleProvider);
}

function ConsoleProvider_$ctor() {
    return new ConsoleProvider();
}

function ConsoleProvider__writeMessage(this$, name, logLevel, messageFunc, exception, formatParams) {
    let msg, enumerator, msg_1, msg_2, msg_3;
    if (messageFunc != null) {
        post(this$.threadSafeWriter, [logLevel, (msg = messageFunc(), ((enumerator = getEnumerator(Stack$1__Items(this$.propertyStack)), (() => {
            try {
                while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                    const forLoopVar = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                    const name_1 = toText(printf("{%s}"))(forLoopVar[0]);
                    const value = toText(printf("%A"))(forLoopVar[1]);
                    msg = replace(msg, name_1, value);
                }
            }
            finally {
                enumerator.Dispose();
            }
        })()), (msg_1 = replace(replace(msg, "{", "{{"), "}", "}}"), (msg_2 = format({}, msg_1, ...formatParams), (msg_3 = ((exception == null) ? msg_2 : format("{0} | {1}", msg_2, toString(exception))), format("{0} | {1} | {2} | {3}", utcNow(), logLevel, name, msg_3))))))]);
        return true;
    }
    else {
        return true;
    }
}

function ConsoleProvider__addProp(this$, key, value) {
    Stack$1__Push_2B595(this$.propertyStack, [key, value]);
    return {
        Dispose() {
            void Stack$1__Pop(this$.propertyStack);
        },
    };
}

export function create() {
    return ConsoleProvider_$ctor();
}

