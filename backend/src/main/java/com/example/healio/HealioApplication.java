package com.example.healio;

import javax.sql.DataSource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class HealioApplication {

	public static void main(String[] args) {
		SpringApplication.run(HealioApplication.class, args);
	}

	@Bean
	public DataSource getDataSource() {
		return DataSourceBuilder.create()
				.driverClassName("com.mysql.cj.jdbc.Driver")
				.url("jdbc:mysql://localhost:3306/healio")
				.username("root")
				.password("1315")
				.build();

	}

}
