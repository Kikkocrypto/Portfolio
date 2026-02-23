package com.portfolio.backend.service;

import com.portfolio.backend.entity.Contact;
import com.portfolio.backend.entity.EmailJob;
import com.portfolio.backend.entity.EmailJobStatus;
import com.portfolio.backend.entity.EmailJobType;
import com.portfolio.backend.repository.EmailJobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailQueueService {

    private static final Logger log = LoggerFactory.getLogger(EmailQueueService.class);

    private final EmailJobRepository emailJobRepository;
    private final String notificationEmail;
    private final boolean sendReplyToSender;

    public EmailQueueService(
            EmailJobRepository emailJobRepository,
            @Value("${app.contact.notification-email:}") String notificationEmail,
            @Value("${app.contact.send-reply-to-sender:true}") boolean sendReplyToSender
    ) {
        this.emailJobRepository = emailJobRepository;
        this.notificationEmail = notificationEmail != null ? notificationEmail.trim() : "";
        this.sendReplyToSender = sendReplyToSender;
    }

    public void enqueueContactEmails(Contact contact) {
        long now = System.currentTimeMillis();

        if (!notificationEmail.isEmpty()) {
            EmailJob notifyOwner = new EmailJob();
            notifyOwner.setType(EmailJobType.CONTACT_NOTIFY_OWNER);
            notifyOwner.setStatus(EmailJobStatus.PENDING);
            notifyOwner.setContactId(contact.getId());
            notifyOwner.setAttempts(0);
            notifyOwner.setNextAttemptAtMs(now);
            emailJobRepository.save(notifyOwner);
        } else {
            log.debug("EmailQueue: skip notify-owner (notification email not configured)");
        }

        if (sendReplyToSender) {
            EmailJob replySender = new EmailJob();
            replySender.setType(EmailJobType.CONTACT_REPLY_SENDER);
            replySender.setStatus(EmailJobStatus.PENDING);
            replySender.setContactId(contact.getId());
            replySender.setAttempts(0);
            replySender.setNextAttemptAtMs(now);
            emailJobRepository.save(replySender);
        }

        log.info("EmailQueue: jobs enqueued for nuovo contatto");
    }
}

