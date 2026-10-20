package com.surveyflow.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.DriverManager;
import java.util.UUID;

import org.h2.tools.RunScript;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.Test;

import com.surveyflow.common.enums.EntitlementResetPeriod;
import com.surveyflow.common.enums.EntitlementValueType;
import com.surveyflow.common.enums.SubscriptionBillingPeriod;
import com.surveyflow.common.enums.SubscriptionPlanCode;

class PricingCatalogMigrationTest {

    @Test
    void migrationSeedsCatalogAndJpaMappingsValidate() throws Exception {
        String url = "jdbc:h2:mem:pricing_" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1";
        try (var connection = DriverManager.getConnection(url, "sa", "")) {
            runMigration(connection, "V1__init_schema.sql");
            try (var statement = connection.createStatement()) {
                statement.executeUpdate("""
                        INSERT INTO subscription_plans (
                            code, name, price, is_active, created_at, updated_at
                        ) VALUES
                            ('FREE', 'Free', 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                            ('STUDENT', 'Student', 49000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                            ('PRO', 'Pro', 99000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        """);
            }
            runMigration(connection, "V14__add_pricing_catalog.sql");
        }

        try (var sessionFactory = new Configuration()
                .addAnnotatedClass(SubscriptionPlan.class)
                .addAnnotatedClass(CreditPackage.class)
                .addAnnotatedClass(SubscriptionPrice.class)
                .addAnnotatedClass(PlanEntitlement.class)
                .addAnnotatedClass(RewardCatalogItem.class)
                .setProperty("hibernate.connection.url", url)
                .setProperty("hibernate.connection.username", "sa")
                .setProperty("hibernate.connection.password", "")
                .setProperty("hibernate.hbm2ddl.auto", "validate")
                .buildSessionFactory();
             var session = sessionFactory.openSession()) {
            var packages = session.createQuery(
                    "from CreditPackage p order by p.displayOrder", CreditPackage.class).getResultList();
            assertThat(packages).extracting(CreditPackage::getCode)
                    .containsExactly("STARTER", "STANDARD", "PRO");
            assertThat(packages).extracting(CreditPackage::getCreditAmount)
                    .containsExactly(200L, 600L, 1300L);
            assertThat(packages).extracting(CreditPackage::getPrice)
                    .containsExactly(
                            new java.math.BigDecimal("19000.00"),
                            new java.math.BigDecimal("49000.00"),
                            new java.math.BigDecimal("99000.00"));

            var plans = session.createQuery("from SubscriptionPlan", SubscriptionPlan.class).getResultList();
            assertThat(plans).extracting(SubscriptionPlan::getCode)
                    .contains("FREE", "STUDENT", "PRO", SubscriptionPlanCode.PLUS.name());
            assertThat(plans).filteredOn(SubscriptionPlan::isActive)
                    .extracting(SubscriptionPlan::getCode)
                    .containsExactly(SubscriptionPlanCode.PLUS.name());

            var plusPrice = session.createQuery(
                    "from SubscriptionPrice p where p.plan.code = :code", SubscriptionPrice.class)
                    .setParameter("code", SubscriptionPlanCode.PLUS.name())
                    .getSingleResult();
            assertThat(plusPrice.getBillingPeriod()).isEqualTo(SubscriptionBillingPeriod.MONTH);
            assertThat(plusPrice.getPrice()).isEqualByComparingTo("39000");

            var benefits = session.createQuery(
                    "from PlanEntitlement e where e.plan.code = :code", PlanEntitlement.class)
                    .setParameter("code", SubscriptionPlanCode.PLUS.name())
                    .getResultList();
            assertThat(benefits).hasSize(7);
            assertThat(benefits).filteredOn(e -> e.getCode().equals("MONTHLY_CREDITS"))
                    .singleElement()
                    .satisfies(e -> {
                        assertThat(e.getValueType()).isEqualTo(EntitlementValueType.QUOTA);
                        assertThat(e.getValueAmount()).isEqualTo(500L);
                        assertThat(e.getResetPeriod()).isEqualTo(EntitlementResetPeriod.MONTH);
                    });
            assertThat(benefits).filteredOn(e -> e.getCode().equals("EXTRA_CREDIT_DISCOUNT"))
                    .singleElement()
                    .satisfies(e -> assertThat(e.getValueAmount()).isEqualTo(20L));

            var rewards = session.createQuery(
                    "from RewardCatalogItem r order by r.displayOrder", RewardCatalogItem.class)
                    .getResultList();
            assertThat(rewards).extracting(RewardCatalogItem::getCreditCost)
                    .containsExactly(300L, 500L, 1000L, 5000L, 10000L, 10000L);
            assertThat(rewards.getLast().isActive()).isFalse();
        }
    }

    private void runMigration(java.sql.Connection connection, String fileName) throws Exception {
        try (var stream = getClass().getClassLoader().getResourceAsStream("db/migration/" + fileName)) {
            assertThat(stream).isNotNull();
            RunScript.execute(connection, new InputStreamReader(stream, StandardCharsets.UTF_8));
        }
    }
}
