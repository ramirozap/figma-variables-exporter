"use strict";
// this plugin obtains all the variables from the selected page and outputs them in css format
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fontWeightsMap = {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
};
function getCollections() {
    return __awaiter(this, void 0, void 0, function* () {
        const localVariables = yield figma.variables.getLocalVariableCollectionsAsync();
        return localVariables;
    });
}
function convertToCssName(name) {
    // Replace slashes with hyphens
    let cssName = name.replace(/\//g, "-");
    // Convert camelCase to kebab-case
    cssName = cssName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    return `--${cssName}`;
}
function rgbToHex({ r, g, b, a }) {
    if (a !== 1) {
        return `rgba(${[r, g, b]
            .map((n) => Math.round(n * 255))
            .join(", ")}, ${a.toFixed(4)})`;
    }
    const toHex = (value) => {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    const hex = [toHex(r), toHex(g), toHex(b)].join("");
    return `#${hex}`;
}
function processCollection(_a) {
    return __awaiter(this, arguments, void 0, function* ({ modes, variableIds }) {
        let cssVariables = "";
        for (const mode of modes) {
            for (const variableId of variableIds) {
                const variable = yield figma.variables.getVariableByIdAsync(variableId);
                const value = variable.valuesByMode[mode.modeId];
                const cssName = convertToCssName(variable.name);
                let cssValue = "";
                if (value !== undefined &&
                    ["COLOR", "FLOAT", "STRING"].includes(variable.resolvedType)) {
                    if (value.type === "VARIABLE_ALIAS") {
                        const currentVar = yield figma.variables.getVariableByIdAsync(value.id);
                        cssValue = `var(${convertToCssName(currentVar.name)})`;
                    }
                    else {
                        switch (variable.resolvedType) {
                            case "COLOR":
                                cssValue = rgbToHex(value);
                                break;
                            case "FLOAT":
                                cssValue = `${value}px`;
                                break;
                            default:
                                if (value.toLowerCase() in fontWeightsMap) {
                                    cssValue = fontWeightsMap[value.toLowerCase()];
                                }
                                else {
                                    cssValue = value.toLowerCase();
                                }
                                break;
                        }
                    }
                }
                cssVariables += `${cssName}: ${cssValue}; \n`;
            }
        }
        return cssVariables;
    });
}
figma.ui.onmessage = (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("code received message", e);
    if (e.type === "IMPORT") {
        // const { fileName, body } = e;
        // importJSONFile({ fileName, body });
    }
    else if (e.type === "EXPORT") {
        getCollections().then((collections) => __awaiter(void 0, void 0, void 0, function* () {
            let cssVariables = `:root { \n`;
            for (const collection of collections) {
                cssVariables += yield processCollection(collection);
            }
            cssVariables += `}`;
            figma.ui.postMessage({ type: "EXPORT_RESULT", cssVariables });
        }));
    }
});
if (figma.command === "import") {
    figma.showUI(__uiFiles__["import"], {
        width: 500,
        height: 500,
        themeColors: true,
    });
}
else if (figma.command === "export") {
    figma.showUI(__uiFiles__["export"], {
        width: 500,
        height: 500,
        themeColors: true,
    });
}
