package com.surveyflow.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.request.feedback.CreateFeedbackRequest;
import com.surveyflow.dto.response.feedback.FeedbackItemResponse;
import com.surveyflow.dto.response.feedback.FeedbackSummaryResponse;
import com.surveyflow.model.User;
import com.surveyflow.model.UserFeedback;
import com.surveyflow.repository.UserFeedbackRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.FeedbackService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "FEEDBACK-SERVICE")
@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final UserFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createFeedback(Long userId, CreateFeedbackRequest request) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        String sourcesStr = null;
        if (request.getSources() != null && !request.getSources().isEmpty()) {
            sourcesStr = String.join(",", request.getSources());
        }

        UserFeedback feedback = new UserFeedback();
        feedback.setUser(user);
        feedback.setRating(request.getRating());
        feedback.setSources(sourcesStr);
        feedback.setOtherSource(request.getOtherSource() != null ? request.getOtherSource().trim() : null);
        feedback.setContent(request.getContent() != null ? request.getContent().trim() : null);

        feedbackRepository.save(feedback);
        log.info("Saved feedback: userId={}, rating={}, sources={}", userId, request.getRating(), sourcesStr);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackSummaryResponse getFeedbackSummary() {
        long totalFeedbacks = feedbackRepository.count();
        Double avgRating = feedbackRepository.calculateAverageRating();
        if (avgRating != null) {
            avgRating = Math.round(avgRating * 10.0) / 10.0;
        } else {
            avgRating = 5.0;
        }

        // Count sources distribution across all feedbacks
        List<UserFeedback> allFeedbacks = feedbackRepository.findAll();
        Map<String, Long> sourceCounts = new HashMap<>();

        for (UserFeedback fb : allFeedbacks) {
            if (fb.getSources() != null && !fb.getSources().isBlank()) {
                String[] sources = fb.getSources().split(",");
                for (String source : sources) {
                    String trimmed = source.trim();
                    if (!trimmed.isEmpty()) {
                        sourceCounts.put(trimmed, sourceCounts.getOrDefault(trimmed, 0L) + 1L);
                    }
                }
            }
        }

        List<UserFeedback> recentEntities = feedbackRepository.findRecentFeedbacks(PageRequest.of(0, 20));
        List<FeedbackItemResponse> recentFeedbacks = recentEntities.stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());

        return FeedbackSummaryResponse.builder()
                .totalFeedbacks(totalFeedbacks)
                .averageRating(avgRating)
                .sourceCounts(sourceCounts)
                .recentFeedbacks(recentFeedbacks)
                .build();
    }

    private FeedbackItemResponse mapToItemResponse(UserFeedback feedback) {
        List<String> sourcesList = new ArrayList<>();
        if (feedback.getSources() != null && !feedback.getSources().isBlank()) {
            sourcesList = Arrays.stream(feedback.getSources().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        return FeedbackItemResponse.builder()
                .id(feedback.getId())
                .userId(feedback.getUser() != null ? feedback.getUser().getId() : null)
                .userEmail(feedback.getUser() != null ? feedback.getUser().getEmail() : null)
                .rating(feedback.getRating())
                .sources(sourcesList)
                .otherSource(feedback.getOtherSource())
                .content(feedback.getContent())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
