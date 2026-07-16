package com.ashram.feedback.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class AuditConfig {
    // JPA Auditing is enabled via @EnableJpaAuditing
    // Entities can now use @CreatedDate and @LastModifiedDate
}
