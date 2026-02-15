package com.portfolio.backend.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * Sanitizzazione input utente per mitigare Stored XSS.
 * Rimuove tutti i tag HTML e restituisce solo testo; gli attributi (es. event handler, javascript:)
 * non sono presenti nel risultato.
 */
public final class XssSanitizer {

    private XssSanitizer() {
    }

    /**
     * Rimuove ogni tag HTML dall'input e restituisce solo il testo (entity decode).
     * Null e stringhe vuote/blank restano invariati.
     *
     * @param input stringa eventualmente contenente HTML (es. da form contatti, titolo/contenuto post)
     * @return testo senza tag; null se input è null, altrimenti mai null
     */
    public static String stripHtml(String input) {
        if (input == null || input.isBlank()) {
            return input == null ? null : input.trim();
        }
        String cleaned = Jsoup.clean(input, Safelist.none());
        return cleaned == null ? "" : cleaned.trim();
    }
}
