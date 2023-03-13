export const validationRules = {
    usernameMinLength: 3,
    stringMaxLength: 255,
    passwordRegex: /^[a-zA-Z0-9!@#$%^&*()_\-+=]{6,30}$/,
    usernameRegex: /^[a-zA-Z0-9_]{3,255}$/,
    defaultPagination: 20,
    maxPagination: 1000,
    colorRegex: /^#[0-9A-Fa-f]{6}/,
};
