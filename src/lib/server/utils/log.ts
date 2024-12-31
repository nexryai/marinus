const green: string = "\u001b[32m";
const red: string     = "\u001b[31m";
const yellow: string  = "\u001b[33m";
const reset: string = "\u001b[0m";

export function logInfo(message: string) {
    console.log(`${green}[INFO]${reset} ${message}`);
}

export function logWarn(message: string) {
    console.log(`${yellow}[WARN]${reset} ${message}`);
}

export function logError(message: string) {
    console.log(`${red}[ERROR]${reset} ${message}`);
}
