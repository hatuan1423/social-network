package com.LinkVerse.notification.service;

import com.LinkVerse.event.dto.NotificationEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private final SimpMessagingTemplate messagingTemplate;

    public KafkaConsumerService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "post-unlike-event", groupId = "group_id", containerFactory = "notificationKafkaListenerContainerFactory")
    public void consumePostUnlikeEvent(NotificationEvent notificationEvent) {
        System.out.println("Received Notification Event: " + notificationEvent);
        messagingTemplate.convertAndSendToUser(
                notificationEvent.getRecipient(),
                "/queue/notifications",
                notificationEvent
        );
    }

    @KafkaListener(topics = "post-like-event", groupId = "group_id", containerFactory = "notificationKafkaListenerContainerFactory")
    public void consumePostLikeEvent(NotificationEvent notificationEvent) {
        System.out.println("Received Notification Event: " + notificationEvent);
        messagingTemplate.convertAndSendToUser(
                notificationEvent.getRecipient(),
                "/queue/notifications",
                notificationEvent
        );
    }
}
