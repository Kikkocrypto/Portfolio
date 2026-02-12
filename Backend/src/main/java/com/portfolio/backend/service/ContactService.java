package com.portfolio.backend.service;

import com.portfolio.backend.entity.Contact;
import com.portfolio.backend.repository.ContactRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Transactional
    public Contact save(Contact contact) {
        return contactRepository.save(contact);
    }
}
