const win = window as any;
export const languages = {};

if (!win.languages) {
    win.languages = {};
}

win.languages.ko = languages;