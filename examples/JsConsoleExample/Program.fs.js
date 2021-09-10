import { Types_LogModule_addContext, FsLibLog_Types_ILog__ILog_info$0027_40D5F1D6, Types_LogModule_setMessage, FsLibLog_Types_ILog__ILog_info_40D5F1D6, LogProvider_getLoggerByName, LogProvider_setLoggerProvider } from "../../src/FsLibLog/FsLibLog.fs.js";
import { create } from "./JsConsoleProvider.fs.js";
import { createAtom } from "./.fable/fable-library.3.2.12/Util.js";
import { printf, toText } from "./.fable/fable-library.3.2.12/String.js";

LogProvider_setLoggerProvider(create());

export let count = createAtom(0);

export const logger = LogProvider_getLoggerByName("TestLogger");

export const myButton = document.querySelector(".my-button");

myButton.onclick = ((_arg1) => {
    let arg10;
    FsLibLog_Types_ILog__ILog_info_40D5F1D6(logger, (log) => Types_LogModule_setMessage("Button clicked.", log));
    count(count() + 1, true);
    const wasSent = FsLibLog_Types_ILog__ILog_info$0027_40D5F1D6(logger, (arg) => {
        const log_2 = Types_LogModule_setMessage("Button clicked, count is now {count}", arg);
        return Types_LogModule_addContext("count", count(), log_2);
    });
    myButton.innerText = ((arg10 = (count() | 0), toText(printf("You clicked: %i time(s)"))(arg10)));
});

