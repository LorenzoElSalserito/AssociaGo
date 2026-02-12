package com.associago.utils;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

public class FiscalCodeUtils {

    private static final Map<Character, Integer> ODD_VALUES = new HashMap<>();
    private static final Map<Character, Integer> EVEN_VALUES = new HashMap<>();
    private static final Map<Integer, Character> CHECK_CHARS = new HashMap<>();
    private static final Map<Integer, String> MONTH_CODES = new HashMap<>();

    static {
        // Odd positions values
        int[] odd = {1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23};
        for (int i = 0; i < 26; i++) ODD_VALUES.put((char) ('A' + i), odd[i]);
        for (int i = 0; i < 10; i++) ODD_VALUES.put((char) ('0' + i), odd[i]);

        // Even positions values
        for (int i = 0; i < 26; i++) EVEN_VALUES.put((char) ('A' + i), i);
        for (int i = 0; i < 10; i++) EVEN_VALUES.put((char) ('0' + i), i);

        // Check characters
        for (int i = 0; i < 26; i++) CHECK_CHARS.put(i, (char) ('A' + i));

        // Month codes
        MONTH_CODES.put(1, "A"); MONTH_CODES.put(2, "B"); MONTH_CODES.put(3, "C");
        MONTH_CODES.put(4, "D"); MONTH_CODES.put(5, "E"); MONTH_CODES.put(6, "H");
        MONTH_CODES.put(7, "L"); MONTH_CODES.put(8, "M"); MONTH_CODES.put(9, "P");
        MONTH_CODES.put(10, "R"); MONTH_CODES.put(11, "S"); MONTH_CODES.put(12, "T");
    }

    public static String calculate(String firstName, String lastName, LocalDate birthDate, String gender, String birthPlaceCode) {
        if (firstName == null || lastName == null || birthDate == null || gender == null || birthPlaceCode == null) {
            throw new IllegalArgumentException("All fields are required for Fiscal Code calculation");
        }

        StringBuilder fc = new StringBuilder();
        fc.append(encodeSurname(lastName));
        fc.append(encodeName(firstName));
        fc.append(encodeDateAndGender(birthDate, gender));
        fc.append(birthPlaceCode.toUpperCase());
        
        String partial = fc.toString();
        fc.append(calculateCheckChar(partial));

        return fc.toString();
    }

    private static String encodeSurname(String s) {
        String consonants = getConsonants(s);
        String vowels = getVowels(s);
        String combined = (consonants + vowels + "XXX").substring(0, 3);
        return combined.toUpperCase();
    }

    private static String encodeName(String s) {
        String consonants = getConsonants(s);
        if (consonants.length() >= 4) {
            // Take 1st, 3rd, 4th
            consonants = "" + consonants.charAt(0) + consonants.charAt(2) + consonants.charAt(3);
        }
        String vowels = getVowels(s);
        String combined = (consonants + vowels + "XXX").substring(0, 3);
        return combined.toUpperCase();
    }

    private static String encodeDateAndGender(LocalDate date, String gender) {
        String year = String.valueOf(date.getYear()).substring(2);
        String month = MONTH_CODES.get(date.getMonthValue());
        int day = date.getDayOfMonth();
        if ("F".equalsIgnoreCase(gender)) {
            day += 40;
        }
        return String.format("%s%s%02d", year, month, day);
    }

    private static char calculateCheckChar(String partial) {
        int sum = 0;
        partial = partial.toUpperCase();
        for (int i = 0; i < 15; i++) {
            char c = partial.charAt(i);
            if ((i + 1) % 2 != 0) { // Odd position (1-based)
                sum += ODD_VALUES.getOrDefault(c, 0);
            } else { // Even position
                sum += EVEN_VALUES.getOrDefault(c, 0);
            }
        }
        return CHECK_CHARS.get(sum % 26);
    }

    private static String getConsonants(String s) {
        return s.toUpperCase().replaceAll("[^B-DF-HJ-NP-TV-Z]", "");
    }

    private static String getVowels(String s) {
        return s.toUpperCase().replaceAll("[^AEIOU]", "");
    }
}
