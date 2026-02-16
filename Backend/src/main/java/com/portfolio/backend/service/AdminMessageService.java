package com.portfolio.backend.service;

import com.portfolio.backend.controller.dto.MessageResponse;
import com.portfolio.backend.entity.Contact;
import com.portfolio.backend.exception.MessageNotFoundException;
import com.portfolio.backend.repository.ContactRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Servizio per le operazioni di amministrazione sulle mail ricevute dal form di contatto.
 */
@Service
public class AdminMessageService {

    private static final int FIXED_PAGE_SIZE = 10;
    private static final Sort ORDER_BY_RECEIVED_DESC = Sort.by(Sort.Direction.DESC, "createdAt");

    private final ContactRepository contactRepository;

    public AdminMessageService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    /**
     * Deletes a contact message by ID. No-op if already deleted.
     * @throws MessageNotFoundException if no contact exists with the given ID
     */
    @Transactional
    public void deleteMessage(String id) {
        if (!contactRepository.existsById(id)) {
            throw new MessageNotFoundException();
        }
        contactRepository.deleteById(id);
    }

    /**
     * Returns a single contact message by ID.
     * @throws MessageNotFoundException if no contact exists with the given ID
     */
    @Transactional(readOnly = true)
    public MessageResponse getMessageById(String id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(MessageNotFoundException::new);
        return toMessageResponse(contact);
    }

    /**
     * Returns a page of contact messages ordered by receivedAt (createdAt) DESC.
     * Page size is fixed to {@value #FIXED_PAGE_SIZE}; page index is 0-based.
     */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(int page) {
        Pageable pageable = PageRequest.of(page, FIXED_PAGE_SIZE, ORDER_BY_RECEIVED_DESC);
        Page<Contact> contactPage = contactRepository.findAllByOrderByCreatedAtDesc(pageable);
        return contactPage.map(this::toMessageResponse);
    }

    private MessageResponse toMessageResponse(Contact contact) {
        if (contact == null) {
            return null;
        }
        return MessageResponse.builder()
                .id(contact.getId())
                .name(contact.getName())
                .email(contact.getEmail())
                .message(contact.getMessage())
                .receivedAt(contact.getCreatedAt() != null ? contact.getCreatedAt() : Instant.EPOCH)
                .build();
    }
}
