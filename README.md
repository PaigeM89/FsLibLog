# FsLibLog

## What is this?

FsLibLog is a single file you can copy paste or add through [Paket Github dependencies](https://fsprojects.github.io/Paket/github-dependencies.html) to provide your F# library with a logging abstraction. This is a port of the C# [LibLog](https://github.com/damianh/LibLog).

## Why does this exist?

When creating a library for .NET, you typically do not want to depend on a logging framework or abstraction. Depending on a logging framework forces your consumers to use that framework, which is not ideal. Depending on an abstraction _can_ work but you can run into the [diamond dependency](https://docs.microsoft.com/en-us/dotnet/standard/library-guidance/dependencies#diamond-dependencies) problem. Since this is just a file you compile into your library, no dependency is taken and is transparent to your consumers.

Additionally, loggers aren't particularly friendly for F#, this sets out to resolve that.

## How to get started

### 1. Put the file into your project

#### Option 1

Copy/paste [FsLibLog.fs](https://github.com/TheAngryByrd/FsLibLog/blob/master/src/FsLibLog/FsLibLog.fs) into your library.

#### Option 2

Read over [Paket Github dependencies](https://fsprojects.github.io/Paket/github-dependencies.html).

Add the following line to your `paket.depedencies` file.

```paket
github TheAngryByrd/FsLibLog src/FsLibLog/FsLibLog.fs
```

Then add the following line to projects with `paket.references` file you want FsLibLog to be available to.

```paket
File: FsLibLog.fs
```

### 2. Replace its namespace with yours

To alleviate potential naming conflicts, it's best to replace FsLibLog namespace with your own.

Here is an example with FAKE 5:

```fsharp
Target.create "Replace" <| fun _ ->
  Shell.replaceInFiles
    [ "FsLibLog", "MyLib.Logging" ]
    (!! "paket-files/TheAngryByrd/FsLibLog/src/FsLibLog/FsLibLog.fs")
```

### 3. [Setup a LogProvider](#log-providers)

## Using in your library

### Open namespaces

```fsharp
open FsLibLog
open FsLibLog.Types
```

### Get a logger

There are currently three ways to get a logger.

- `getCurrentLogger` - __Deprecated__ because inferring the correct StackFrame is too difficult. Creates a logger. It's name is based on the current StackFrame.
- `getLoggerByFunc` - Creates a logger based on `Reflection.MethodBase.GetCurrentMethod` call.  This is only useful for calls within functions.
- `getLoggerByQuotation` - Creates a logger given a Quotations.Expr type. This is only useful for module level declarations.
- `getLoggerFor` - Creates a logger given a `'a` type.
- `getLoggerByType` - Creates a logger given a `Type`.
- `getLoggerByName` - Creates a logger given a `string`.

### Set the loglevel, message, exception and parameters

Choose a LogLevel. (Fatal|Error|Warn|Info|Debug|Trace).

There are helper methods on the logger instance, such as `logger.warn`.

These helper functions take a `(Log -> Log)` which allows you to amend the log record easily with functions in the `Log` module.  You can use function composition to set the fields much easier.

```fsharp
logger.warn(
    Log.setMessage "{name} Was said hello to"
    >> Log.addParameter name
)
```

The set of functions to augment the `Log` record are

- `Log.setMessage` - Amends a `Log` with a message
- `Log.setMessageIntepolated` - Ammends `Log` with a message. Using the syntax of `{variableName:loggerName}` it will automatically convert an intermpolated string into a proper message template.
- `Log.setMessageThunk` - Amends a `Log` with a message thunk.  Useful for "expensive" string construction scenarios.
- `Log.addParameter` - Amends a `Log` with a parameter.
- `Log.addParameters` - Amends a `Log` with a list of parameters.
- `Log.addContext` - Amends a `Log` with additional named parameters for context. This helper adds more context to a log.  This DOES NOT affect the parameters set for a message template. This is the same calling OpenMappedContext right before logging.
- `Log.addContextDestructured` - Amends a `Log` with additional named parameters for context. This helper adds more context to a log. This DOES NOT affect the parameters set for a message template. This is the same calling OpenMappedContext right before logging. This destructures an object rather than calling `ToString()` on it.  WARNING: Destructring can be expensive
- `Log.addException` - Amends a `Log` with an exception.

### Full Example

```fsharp
namespace SomeLib
open FsLibLog
open FsLibLog.Types
open FsLibLog.Operators


module Say =
    let logger = LogProvider.getCurrentLogger()

    type AdditionalData = {
        Name : string
    }


    // Example Log Output:
    // 16:23 [Information] <SomeLib.Say> () "Captain" Was said hello to - {"UserContext": {"Name": "User123", "$type": "AdditionalData"}, "FunctionName": "hello"}
    let hello name  =
        // Starts the log out as an Informational log
        logger.info(
            Log.setMessage "{name} Was said hello to"
            // MessageTemplates require the order of parameters to be consistent with the tokens to replace
            >> Log.addParameter name
            // This adds additional context to the log, it is not part of the message template
            // This is useful for things like MachineName, ProcessId, ThreadId, or anything that doesn't easily fit within a MessageTemplate
            // This is the same as calling `LogProvider.openMappedContext` right before logging.
            >> Log.addContext "FunctionName" "hello"
            // This is the same as calling `LogProvider.openMappedContextDestucturable`  right before logging.
            >> Log.addContextDestructured "UserContext"  {Name = "User123"}
        )
        sprintf "hello %s." name


    // Example Log Output:
    // 16:23 [Debug] <SomeLib.Say> () In nested - {"DestructureTrue": {"Name": "Additional", "$type": "AdditionalData"}, "DestructureFalse": "{Name = \"Additional\";}", "Value": "bar"}
    // [Information] <SomeLib.Say> () "Commander" Was said hello to - {"UserContext": {"Name": "User123", "$type": "AdditionalData"}, "FunctionName": "hello", "DestructureTrue": {"Name": "Additional", "$type": "AdditionalData"}, "DestructureFalse": "{Name = \"Additional\";}", "Value": "bar"}
    let nestedHello name =
        // This sets additional context to any log within scope
        // This is useful if you want to add this to all logs within this given scope
        use x = LogProvider.openMappedContext "Value" "bar"
        // This doesn't destructure the record and calls ToString on it
        use x = LogProvider.openMappedContext "DestructureFalse" {Name = "Additional"}
        // This does destructure the record,  Destructuring can be expensive depending on how big the object is.
        use x = LogProvider.openMappedContextDestucturable "DestructureTrue" {Name = "Additional"} true

        logger.debug(
            Log.setMessage "In nested"
        )
        // The log in `hello` should also have these additional contexts added
        hello name


    // Example Log Output:
    // 16:23 [Error] <SomeLib.Say> () "DaiMon" was rejected. - {}
    // System.Exception: Sorry DaiMon isnt valid
    //    at Microsoft.FSharp.Core.PrintfModule.PrintFormatToStringThenFail@1647.Invoke(String message)
    //    at SomeLib.Say.fail(String name) in /Users/jimmybyrd/Documents/GitHub/FsLibLog/examples/SomeLib/Library.fs:line 57
    let fail name =
        try
            failwithf "Sorry %s isnt valid" name
        with e ->
            // Starts the log out as an Error log
            logger.error(
                Log.setMessage "{name} was rejected."
                // MessageTemplates require the order of parameters to be consistent with the tokens to replace
                >> Log.addParameter name
                // Adds an exception to the log
                >> Log.addException  e
            )

    // Example Log Output:
    // 2021-09-15T20:34:14.9060810-04:00 [Information] <SomeLib.Say> () The user {"Name": "Ensign Kim", "$type": "AdditionalData"} has requested a reservation date of "2021-09-16T00:34:14.8853360+00:00"
    let interpolated (person : AdditionalData) (reservationDate : DateTimeOffset) =
        // Starts the log out as an Info log
        logger.info(
            // Generates a message template via a specific string intepolation syntax.
            // Add the name of the property after the expression
            // for example: "person" will be logged as "User" and "reservationDate" as "ReservationDate"
            Log.setMessageI $"The user {person:User} has requested a reservation date of {reservationDate:ReservationDate} "
        )

    // Has the same logging output as `hello`, above, but uses the Operators module.
    let helloWithOperators name =
        // Initiate a log with a message
        !! "{name} Was said hello to"
        // Add a parameter
        >>! name
        // Adds a value, but does not destructure it.
        >>!- ("FunctionName", "operators")
        // Adds a value & destructures it.
        >>!+ ("UserContext", {Name = "User123"})
        // Logs at the Info level.
        |> logger.info
        sprintf "hello %s." name

```

## Log Providers

Providers are the actual logging framework that sends the logs to some destination (console, file, logging service). FsLibLog uses reflection to inspect the running application and wire these up telling FsLibLog to do it.

### Currently supported provider

- [Serilog](https://github.com/serilog/serilog)
- [Microsoft.Extensions.Logging](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/?view=aspnetcore-5.0)

#### Setting up Serilog

1. Install [Serilog](https://www.nuget.org/packages/Serilog)
2. Install [Serilog.Sinks.ColoredConsole](https://www.nuget.org/packages/Serilog.Sinks.Console/) (or any other [Sink](https://github.com/serilog/serilog/wiki/Provided-Sinks))
3. Create your `Logger`

    ```fsharp
        let log =
            LoggerConfiguration()
                .MinimumLevel.Verbose()
                .WriteTo.Console(outputTemplate= "{Timestamp:o} [{Level}] <{SourceContext}> ({Name:l}) {Message:j} - {Properties:j}{NewLine}{Exception}")
                .Enrich.FromLogContext()
                .CreateLogger();
        Log.Logger <- log
    ```

4. FsLibLog will pick up Serilog automatically, no need to tell FsLibLog about it

### Setting up Microsoft.Extensions.Logging

1. Install [Microsoft.Extensions.Logging](https://www.nuget.org/packages/Microsoft.Extensions.Logging/)
2. Install [Microsoft.Extensions.Logging.Console](https://www.nuget.org/packages/Microsoft.Extensions.Logging.Console) (or any other [Provider](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/?view=aspnetcore-5.0#logging-providers-1))
3. Create your `ILoggerFactory`

    ```fsharp
    let microsoftLoggerFactory = LoggerFactory.Create(fun builder ->
            builder
                .SetMinimumLevel(LogLevel.Debug)
                .AddSimpleConsole(fun opts -> opts.IncludeScopes <-true)
                // .AddJsonConsole(fun opts -> opts.IncludeScopes <- true)
            |> ignore

        )
    ```

4. Tell FsLibLog to use this factory

    ```fsharp
    FsLibLog.Providers.MicrosoftExtensionsLoggingProvider.setMicrosoftLoggerFactory microsoftLoggerFactory
    ```

    1. One downside to this is you need to do this for every library your application consumes that uses FsLiblog.

#### Custom Providers

You can implement and teach FsLibLog about your own custom provider if one is not listed. You have to do 2 things:

1. You have to implement the `ILogProvider` interface. [Example Implemenation](https://github.com/TheAngryByrd/FsLibLog/blob/master/examples/ConsoleExample/Program.fs#L5-L90)
2. You have to tell FsLibLog to use it. [Example calling FsLibLog.LogProvider.setLoggerProvider](https://github.com/TheAngryByrd/FsLibLog/blob/master/examples/ConsoleExample/Program.fs#L94)
    1. One downside to this is you need to do this for every library your application consumes that uses FsLiblog.

---

## String Interpolation

This allows for [string interpolation](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/interpolated-strings) with a special syntax to be convertable to [Message Templates](https://messagetemplates.org/) used in underlying providers (such as Serilog).

Typically when one uses string interpolation it works as such:

```fsharp
let favoriteCartoon = "Captain Planet"
let dayItsOn = "Saturday"
printfn $"My favorite cartoon is {favoriteCartoon} and airs on {dayItsOn}"
```

F# compiler will create a [FormattableString](https://docs.microsoft.com/en-us/dotnet/api/system.formattablestring?view=net-5.0) where it's `Format` property looks like `My favorite cartoon is {0} and airs on {1}` and the `GetArguments()` are `[| "Captain Planet";  "Saturday" |]`.  As you can see, `FormattableString` doesn't have the named parameters that `Message Templates` would want.  To make this work the way we want we need to introduce a specific syntax.

```fsharp
let favoriteCartoon = "Captain Planet"
let dayItsOn = "Saturday"
printfn $"My favorite cartoon is {favoriteCartoon:CartoonShow} and airs on {dayItsOn:DayAired}"
```

`setMessageInterpolated` will make the template look like `My favorite cartoon is {CartoonShow} and airs on {DayAired}`.  This will replace the number arguments with the names after the colon within the interpolated string. This makes a usable message template.

- Why aren't we just trying to get the name of the variable/value? Needing to specify dedicate names _is a good thing_ since refactoring your variable names can have drastic effects on your logging queries. Explicit naming separates these concerns.

## Builds

GitHub Actions |
:---: |
[![GitHub Actions](https://github.com/TheAngryByrd/FsLibLog/workflows/Build%20master/badge.svg)](https://github.com/TheAngryByrd/FsLibLog/actions?query=branch%3Amaster) |
[![Build History](https://buildstats.info/github/chart/TheAngryByrd/FsLibLog)](https://github.com/TheAngryByrd/FsLibLog/actions?query=branch%3Amaster) |

---

### Building

Make sure the following **requirements** are installed in your system:

- [dotnet SDK](https://www.microsoft.com/net/download/core) 2.0 or higher
- [Mono](http://www.mono-project.com/) if you're on Linux or macOS.

```bash
> build.cmd // on windows
$ ./build.sh  // on unix
```

#### Environment Variables

- `CONFIGURATION` will set the [configuration](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-build?tabs=netcore2x#options) of the dotnet commands.  If not set it will default to Release.
  - `CONFIGURATION=Debug ./build.sh` will result in things like `dotnet build -c Debug`
- `GITHUB_TOKEN` will be used to upload release notes and nuget packages to github.
  - Be sure to set this before releasing

### Watch Tests

The `WatchTests` target will use [dotnet-watch](https://github.com/aspnet/Docs/blob/master/aspnetcore/tutorials/dotnet-watch.md) to watch for changes in your lib or tests and re-run your tests on all `TargetFrameworks`

```bash
./build.sh WatchTests
```

### Releasing

- [Start a git repo with a remote](https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/)

```bash
git add .
git commit -m "Scaffold"
git remote add origin origin https://github.com/user/MyCoolNewLib.git
git push -u origin master
```

- [Add your nuget API key to paket](https://fsprojects.github.io/Paket/paket-config.html#Adding-a-NuGet-API-key)

```bash
paket config add-token "https://www.nuget.org" 4003d786-cc37-4004-bfdf-c4f3e8ef9b3a
```

- [Create a GitHub OAuth Token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
  - You can then set the `GITHUB_TOKEN` to upload release notes and artifacts to github
  - Otherwise it will fallback to username/password

- Then update the `RELEASE_NOTES.md` with a new version, date, and release notes [ReleaseNotesHelper](https://fsharp.github.io/FAKE/apidocs/fake-releasenoteshelper.html)

```markdown
#### 0.2.0 - 2017-04-20
* FEATURE: Does cool stuff!
* BUGFIX: Fixes that silly oversight
```

- You can then use the `Release` target.  This will:
  - make a commit bumping the version:  `Bump version to 0.2.0` and add the release notes to the commit
  - publish the package to nuget
  - push a git tag

```bash
./build.sh Release
```

### Code formatting

To format code run the following target

```bash
./build.sh FormatCode
```

This uses [Fantomas](https://github.com/fsprojects/fantomas) to do code formatting.  Please report code formatting bugs to that repository.
