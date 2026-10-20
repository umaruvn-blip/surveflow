package com.surveyflow.service.impl;

import java.time.Year;
import java.time.ZoneOffset;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.request.user.ProfileUpdateRequest;
import com.surveyflow.dto.request.user.ReplaceInterestsRequest;
import com.surveyflow.dto.response.user.InterestResponse;
import com.surveyflow.dto.response.user.InterestsResponse;
import com.surveyflow.dto.response.user.UserProfileResponse;
import com.surveyflow.exception.InvalidRequestException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.Interest;
import com.surveyflow.model.User;
import com.surveyflow.model.UserInterest;
import com.surveyflow.model.UserProfile;
import com.surveyflow.repository.InterestRepository;
import com.surveyflow.repository.UserInterestRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "USER-SERVICE")
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final UserInterestRepository userInterestRepository;
    private final InterestRepository interestRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = requireUser(userId);
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        return toProfileResponse(user, profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        validateProfile(request);
        User user = requireLockedUser(userId);
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
        }

        profile.setDisplayName(request.displayName());
        profile.setBirthYear(request.birthYear());
        profile.setGender(request.gender());
        profile.setSchool(request.school());
        profile.setOccupation(request.occupation());
        profile.setBio(request.bio());

        profileRepository.save(profile);
        log.info("User profile updated: userId={}", userId);
        return toProfileResponse(user, profile);
    }

    @Override
    @Transactional
    public InterestsResponse replaceInterests(Long userId, ReplaceInterestsRequest request) {
        List<Long> requestedIds = request.interestIds();
        if (requestedIds == null || requestedIds.stream().anyMatch(id -> id == null || id <= 0)
                || new HashSet<>(requestedIds).size() != requestedIds.size()) {
            throw new InvalidRequestException("interestIds must contain unique positive IDs");
        }

        User user = requireLockedUser(userId);
        Set<Long> requestedSet = new HashSet<>(requestedIds);
        List<Interest> interests = interestRepository.findAllById(requestedSet);
        if (interests.size() != requestedSet.size() || interests.stream().anyMatch(interest -> !interest.isActive())) {
            throw new InvalidRequestException("One or more interests are invalid or inactive");
        }

        List<UserInterest> current = userInterestRepository.findByUserIdWithInterest(userId);
        Set<Long> currentIds = current.stream().map(item -> item.getInterest().getId()).collect(Collectors.toSet());
        List<UserInterest> removed = current.stream()
                .filter(item -> !requestedSet.contains(item.getInterest().getId())).toList();
        userInterestRepository.deleteAll(removed);

        Map<Long, Interest> byId = interests.stream().collect(Collectors.toMap(Interest::getId, Function.identity()));
        List<UserInterest> added = requestedSet.stream()
                .filter(id -> !currentIds.contains(id))
                .map(id -> {
                    UserInterest item = new UserInterest();
                    item.setUser(user);
                    item.setInterest(byId.get(id));
                    return item;
                }).toList();
        userInterestRepository.saveAll(added);
        log.info("User interests replaced: userId={}, addedCount={}, removedCount={}, totalCount={}",
                userId, added.size(), removed.size(), requestedSet.size());

        List<InterestResponse> result = interests.stream().map(this::toInterestResponse)
                .sorted((left, right) -> left.id().compareTo(right.id())).toList();
        return new InterestsResponse(result);
    }

    private void validateProfile(ProfileUpdateRequest request) {
        Integer birthYear = request.birthYear();
        if (birthYear != null && birthYear > Year.now(ZoneOffset.UTC).getValue()) {
            throw new InvalidRequestException("birthYear must not be in the future");
        }
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User requireLockedUser(Long userId) {
        return userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserProfileResponse toProfileResponse(User user, UserProfile profile) {
        List<InterestResponse> interests = userInterestRepository.findByUserIdWithInterest(user.getId())
                .stream().map(item -> toInterestResponse(item.getInterest()))
                .sorted(Comparator.comparing(InterestResponse::id)).toList();
        return new UserProfileResponse(
                user.getId(), user.getEmail(), user.getReferralCode(),
                profile == null ? null : profile.getDisplayName(),
                profile == null ? null : profile.getAvatarUrl(),
                profile == null ? null : profile.getBirthYear(),
                profile == null ? null : profile.getGender(),
                profile == null ? null : profile.getSchool(),
                profile == null ? null : profile.getOccupation(),
                profile == null ? null : profile.getBio(),
                interests);
    }

    private InterestResponse toInterestResponse(Interest interest) {
        return new InterestResponse(interest.getId(), interest.getName(), interest.getSlug(), interest.isActive());
    }
}
