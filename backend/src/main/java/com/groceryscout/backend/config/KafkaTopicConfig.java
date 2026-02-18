package com.groceryscout.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaTopicConfig {

    @Bean
    public NewTopic ordersCreatedTopic() {
        return TopicBuilder.name("orders.created")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryUpdatesTopic() {
        return TopicBuilder.name("inventory.updates")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic notificationsEmailTopic() {
        return TopicBuilder.name("notifications.email")
                .partitions(1)
                .replicas(1)
                .build();
    }
}
