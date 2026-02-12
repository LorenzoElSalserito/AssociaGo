package com.associago;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AssociaGoApplication {

    public static void main(String[] args) {
        // Set default data path if not provided
        if (System.getProperty("associago.data.path") == null) {
            String userHome = System.getProperty("user.home");
            System.setProperty("associago.data.path", userHome + "/.associago");
        }
        SpringApplication.run(AssociaGoApplication.class, args);
    }

}
