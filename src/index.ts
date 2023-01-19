import os from "os";
import WgStrategy from "./strategies/wgStrategy";
import WgLinuxStrategy from "./strategies/wgLinuxStrategy";
// import WgWindowsStrategy from "./strategies/wgWindowsStrategy";
// import WgMacStrategy from "./strategies/wgMacStrategy";


export function getStrategy(): WgStrategy {
    switch (os.platform()) {
        case "linux":
            return new WgLinuxStrategy();
        // case "win32":
        //     return new WgWindowsStrategy();
        // case "darwin":
        //     return new WgMacStrategy();
        default:
            throw new Error("Unsupported OS");
    };
}

export * from "./wgConfig";
