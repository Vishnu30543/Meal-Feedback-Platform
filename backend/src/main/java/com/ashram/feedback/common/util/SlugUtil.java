package com.ashram.feedback.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_DASHES = Pattern.compile("-{2,}");

    private SlugUtil() {
        // Utility class — no instantiation
    }

    /**
     * Generates a URL-safe slug from a given string.
     * Example: "Bottle Gourd Curry" → "bottle-gourd-curry"
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withDashes = WHITESPACE.matcher(normalized).replaceAll("-");
        String cleaned = NON_LATIN.matcher(withDashes).replaceAll("");
        String noMultipleDashes = MULTIPLE_DASHES.matcher(cleaned).replaceAll("-");

        return noMultipleDashes.toLowerCase(Locale.ENGLISH)
                .replaceAll("^-+", "")
                .replaceAll("-+$", "");
    }
}
