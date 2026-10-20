package com.surveyflow.repository.specification;

import java.time.Instant;
import java.util.Locale;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;

import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.common.enums.UserGender;
import com.surveyflow.model.Survey;
import com.surveyflow.model.SurveyParticipation;
import com.surveyflow.model.SurveyTargetInterest;
import com.surveyflow.model.SurveyTargeting;
import com.surveyflow.model.UserProfile;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public final class SurveySpecifications {

    private SurveySpecifications() {
    }

    /**
     * Lọc survey có thể hiển thị cho user tại thời điểm hiện tại.
     */
    public static Specification<Survey> discoverableFor(
            Long userId,
            UserProfile profile,
            Set<Long> userInterestIds,
            Instant now) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.and(
                criteriaBuilder.equal(root.get("status"), SurveyStatus.PUBLISHED),
                criteriaBuilder.notEqual(root.get("creator").get("id"), userId),
                criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("deadline")),
                        criteriaBuilder.greaterThan(root.get("deadline"), now)),
//                matchesTargeting(root, criteriaBuilder, profile),
                // matchesInterests(root, query, criteriaBuilder, userInterestIds),
                hasAvailableCapacity(root, query, criteriaBuilder, now));
    }

    private static Predicate hasAvailableCapacity(
            Root<Survey> survey,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder,
            Instant now) {
        Subquery<Long> occupiedSlots = query.subquery(Long.class);
        Root<SurveyParticipation> participation = occupiedSlots.from(SurveyParticipation.class);
        Predicate activeReservation = criteriaBuilder.and(
                criteriaBuilder.equal(participation.get("status"), ParticipationStatus.RESERVED),
                criteriaBuilder.greaterThan(participation.get("slotExpiresAt"), now));
        occupiedSlots.select(criteriaBuilder.count(participation)).where(
                criteriaBuilder.equal(participation.get("survey"), survey),
                criteriaBuilder.or(
                        criteriaBuilder.equal(participation.get("status"), ParticipationStatus.VERIFIED),
                        criteriaBuilder.equal(participation.get("status"), ParticipationStatus.SUBMITTED),
                        activeReservation));
        return criteriaBuilder.lessThan(
                occupiedSlots,
                survey.<Long>get("targetResponseCount").as(Long.class));
    }

    private static Predicate matchesTargeting(
            Root<Survey> survey,
            CriteriaBuilder criteriaBuilder,
            UserProfile profile) {
        Join<Survey, SurveyTargeting> targeting = survey.join("targeting", JoinType.LEFT);
        Integer birthYear = profile == null ? null : profile.getBirthYear();
        UserGender gender = profile == null ? null : profile.getGender();
        String school = profile == null ? null : profile.getSchool();
        String occupation = profile == null ? null : profile.getOccupation();

        return criteriaBuilder.and(
                matchesMinimumBirthYear(criteriaBuilder, targeting.get("minBirthYear"), birthYear),
                matchesMaximumBirthYear(criteriaBuilder, targeting.get("maxBirthYear"), birthYear),
                matchesGender(criteriaBuilder, targeting.get("gender"), gender),
                matchesText(criteriaBuilder, targeting.get("school"), school),
                matchesText(criteriaBuilder, targeting.get("occupation"), occupation));
    }

    private static Predicate matchesMinimumBirthYear(
            CriteriaBuilder criteriaBuilder, Path<Integer> targetBirthYear, Integer userBirthYear) {
        return userBirthYear == null
                ? criteriaBuilder.isNull(targetBirthYear)
                : criteriaBuilder.or(
                criteriaBuilder.isNull(targetBirthYear),
                criteriaBuilder.lessThanOrEqualTo(targetBirthYear, userBirthYear));
    }

    private static Predicate matchesMaximumBirthYear(
            CriteriaBuilder criteriaBuilder, Path<Integer> targetBirthYear, Integer userBirthYear) {
        return userBirthYear == null
                ? criteriaBuilder.isNull(targetBirthYear)
                : criteriaBuilder.or(
                criteriaBuilder.isNull(targetBirthYear),
                criteriaBuilder.greaterThanOrEqualTo(targetBirthYear, userBirthYear));
    }

    private static Predicate matchesGender(
            CriteriaBuilder criteriaBuilder, Path<UserGender> targetGender, UserGender userGender) {
        return userGender == null
                ? criteriaBuilder.isNull(targetGender)
                : criteriaBuilder.or(
                criteriaBuilder.isNull(targetGender),
                criteriaBuilder.equal(targetGender, userGender));
    }

    private static Predicate matchesText(
            CriteriaBuilder criteriaBuilder, Path<String> targetValue, String userValue) {
        if (userValue == null) {
            return criteriaBuilder.isNull(targetValue);
        }
        return criteriaBuilder.or(
                criteriaBuilder.isNull(targetValue),
                criteriaBuilder.equal(
                        criteriaBuilder.lower(targetValue),
                        userValue.strip().toLowerCase(Locale.ROOT)));
    }

    private static Predicate matchesInterests(
            Root<Survey> survey,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder,
            Set<Long> userInterestIds) {
        Subquery<Integer> requiredInterest = query.subquery(Integer.class);
        Root<SurveyTargetInterest> targetInterest = requiredInterest.from(SurveyTargetInterest.class);
        requiredInterest.select(criteriaBuilder.literal(1)).where(
                criteriaBuilder.equal(targetInterest.get("survey"), survey));
        Predicate hasNoRequiredInterest = criteriaBuilder.not(criteriaBuilder.exists(requiredInterest));
        if (userInterestIds.isEmpty()) {
            return hasNoRequiredInterest;
        }

        Subquery<Integer> matchingInterest = query.subquery(Integer.class);
        Root<SurveyTargetInterest> matchingTargetInterest = matchingInterest.from(SurveyTargetInterest.class);
        matchingInterest.select(criteriaBuilder.literal(1)).where(
                criteriaBuilder.equal(matchingTargetInterest.get("survey"), survey),
                matchingTargetInterest.get("interest").get("id").in(userInterestIds));
        return criteriaBuilder.or(hasNoRequiredInterest, criteriaBuilder.exists(matchingInterest));
    }
}
