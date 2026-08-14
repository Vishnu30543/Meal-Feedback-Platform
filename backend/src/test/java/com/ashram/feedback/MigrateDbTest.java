package com.ashram.feedback;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@SpringBootTest
public class MigrateDbTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void runFlywayAndVerify() throws Exception {
        System.out.println("Starting Flyway migration...");
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();

        flyway.migrate();
        System.out.println("Flyway migration completed successfully!");

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM daily_menus WHERE menu_date BETWEEN '2026-07-31' AND '2026-08-14'")) {
                if (rs.next()) {
                    System.out.println("Total Daily Menus (Jul 31 - Aug 14): " + rs.getInt(1));
                }
            }

            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM dish_ratings")) {
                if (rs.next()) {
                    System.out.println("Total Dish Ratings in DB: " + rs.getInt(1));
                }
            }

            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM overall_lunch_ratings")) {
                if (rs.next()) {
                    System.out.println("Total Overall Lunch Ratings in DB: " + rs.getInt(1));
                }
            }

            try (ResultSet rs = stmt.executeQuery(
                    "SELECT menu_date, COUNT(DISTINCT r.id) as rated_count, AVG(o.rating) as avg_rating " +
                    "FROM daily_menus m " +
                    "LEFT JOIN overall_lunch_ratings o ON m.id = o.menu_id " +
                    "LEFT JOIN residents r ON o.resident_id = r.id " +
                    "WHERE m.menu_date BETWEEN '2026-07-31' AND '2026-08-14' " +
                    "GROUP BY menu_date ORDER BY menu_date")) {
                System.out.println("--- Day-by-Day Stats ---");
                while (rs.next()) {
                    System.out.printf("Date: %s | Rated: %d | Avg Rating: %.2f%n",
                            rs.getDate("menu_date"),
                            rs.getInt("rated_count"),
                            rs.getDouble("avg_rating"));
                }
            }
        }
    }
}
