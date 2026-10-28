package com.associago.shared.i18n;

/**
 * Validation error whose user-facing text lives in the message bundles.
 * {@link #getMessage()} returns the bundle code; handlers resolve it with {@link Messages#describe}.
 */
public class LocalizedException extends IllegalArgumentException {

    private final String code;
    private final transient Object[] args;

    public LocalizedException(String code, Object... args) {
        super(code);
        this.code = code;
        this.args = args;
    }

    public String getCode() {
        return code;
    }

    public Object[] getArgs() {
        return args;
    }
}
