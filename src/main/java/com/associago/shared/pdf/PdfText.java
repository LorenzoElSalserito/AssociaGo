package com.associago.shared.pdf;

import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Currency;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Text helpers for the Standard 14 fonts (WinAnsi encoding): a sanitiser that never lets
 * an unsupported character reach PDFBox, plus locale-aware date and money formatting.
 */
public final class PdfText {

    private static final PDType1Font PROBE = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final Map<Integer, Boolean> ENCODABLE = new ConcurrentHashMap<>();
    private static final Currency EUR = Currency.getInstance("EUR");
    /** Latin letters outside WinAnsi that have no Unicode decomposition. */
    private static final Map<Integer, String> LATIN_FALLBACK = Map.of(
            (int) 'Ł', "L", (int) 'ł', "l", (int) 'Đ', "D", (int) 'đ', "d", (int) 'ı', "i", (int) 'Ħ', "H", (int) 'ħ', "h");

    private PdfText() {}

    /**
     * Returns text that Helvetica/WinAnsi can always show: whitespace (including narrow no-break
     * spaces used by some locales) becomes a plain space, accented letters outside WinAnsi lose
     * their accent, symbols such as emoji are dropped and anything else becomes "?".
     */
    public static String sanitize(String text) {
        if (text == null || text.isEmpty()) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFC);
        StringBuilder out = new StringBuilder(normalized.length());
        normalized.codePoints().forEach(cp -> appendSafe(out, cp));
        return out.toString();
    }

    private static void appendSafe(StringBuilder out, int cp) {
        if (Character.isWhitespace(cp) || Character.isSpaceChar(cp)) {
            out.append(' ');
            return;
        }
        int type = Character.getType(cp);
        if (type == Character.CONTROL || type == Character.FORMAT || type == Character.NON_SPACING_MARK
                || type == Character.ENCLOSING_MARK) {
            return;
        }
        if (canEncode(cp)) {
            out.appendCodePoint(cp);
            return;
        }
        if (LATIN_FALLBACK.containsKey(cp)) {
            out.append(LATIN_FALLBACK.get(cp));
            return;
        }
        String base = Normalizer.normalize(new String(Character.toChars(cp)), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        if (!base.isEmpty() && base.codePoints().allMatch(PdfText::canEncode)) {
            out.append(base);
        } else if (type == Character.OTHER_SYMBOL || type == Character.SURROGATE || type == Character.PRIVATE_USE
                || type == Character.UNASSIGNED || Character.isSupplementaryCodePoint(cp)) {
            // Emoji and pictographs carry no text; dropping them keeps names readable.
        } else {
            out.append('?');
        }
    }

    private static boolean canEncode(int cp) {
        return ENCODABLE.computeIfAbsent(cp, c -> {
            try {
                PROBE.encode(new String(Character.toChars(c)));
                return true;
            } catch (Exception e) {
                return false;
            }
        });
    }

    public static String date(LocalDate date, Locale locale) {
        return date == null ? "" : DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(locale).format(date);
    }

    public static String dateTime(LocalDateTime dateTime, Locale locale) {
        return dateTime == null ? ""
                : DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM, FormatStyle.SHORT).withLocale(locale).format(dateTime);
    }

    /** Euro amount in the conventions of the locale, e.g. "1.234,56 €" (it) or "€1,234.56" (en). */
    public static String money(BigDecimal amount, Locale locale) {
        NumberFormat format = NumberFormat.getCurrencyInstance(locale);
        format.setCurrency(EUR);
        return format.format(amount == null ? BigDecimal.ZERO : amount);
    }

    public static String number(Number value, Locale locale) {
        return value == null ? "" : NumberFormat.getNumberInstance(locale).format(value);
    }
}
