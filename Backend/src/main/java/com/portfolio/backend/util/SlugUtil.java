package com.portfolio.backend.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Genera slug da titolo: "La vittoria del campionato" → "la-vittoria-del-campionato".
 * Minuscolo, spazi → trattini, rimozione numeri e caratteri speciali, normalizzazione accenti.
 */
public final class SlugUtil {

    private static final Pattern NON_LETTER_OR_HYPHEN = Pattern.compile("[^a-z\\-]+");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-+");

    private SlugUtil() {
    }

    /**
     * Converte un titolo in slug: minuscolo, spazi in trattini, niente numeri, accenti normalizzati.
     * Esempio: "La vittoria del campionato" → "la-vittoria-del-campionato"
     */
    public static String slugify(String title) {
        if (title == null || title.isBlank()) {
            return "";
        }
        String nfd = Normalizer.normalize(title.trim(), Normalizer.Form.NFD);
        String noAccents = nfd.replaceAll("\\p{M}", "");
        String lower = noAccents.toLowerCase(Locale.ROOT);
        String noSpecial = NON_LETTER_OR_HYPHEN.matcher(lower).replaceAll("-");
        String singleHyphen = MULTIPLE_HYPHENS.matcher(noSpecial).replaceAll("-");
        return singleHyphen.replaceAll("^-|-$", "");
    }
}
