package com.portfolio.backend.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.UUID;

/**
 * Mappa UUID ↔ String per SQLite (colonne TEXT invece di BINARY).
 * Con autoApply=true si applica a tutti i campi UUID delle entità.
 * Gestisce stringhe lunghe o in formato 32 caratteri (senza trattini) per compatibilità.
 */
@Converter(autoApply = true)
public class UuidToStringConverter implements AttributeConverter<UUID, String> {

    private static final int UUID_STRING_LENGTH = 36;
    private static final int UUID_HEX_LENGTH = 32;

    @Override
    public String convertToDatabaseColumn(UUID attribute) {
        return attribute == null ? null : attribute.toString();
    }

    @Override
    public UUID convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        String s = dbData.trim();
        if (s.length() > UUID_STRING_LENGTH) {
            s = s.substring(0, UUID_STRING_LENGTH);
        }
        if (s.length() == UUID_HEX_LENGTH && s.matches("[0-9a-fA-F]{32}")) {
            s = s.substring(0, 8) + "-" + s.substring(8, 12) + "-" + s.substring(12, 16)
                    + "-" + s.substring(16, 20) + "-" + s.substring(20, 32);
        }
        return UUID.fromString(s);
    }
}
