package com.surveyflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.response.metadata.BadgeResponse;
import com.surveyflow.model.Badge;
import com.surveyflow.repository.BadgeRepository;
import com.surveyflow.service.BadgeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository repository;

    @Override
    public List<BadgeResponse> getBadges() {
        return repository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(item -> new BadgeResponse(item.getId(), item.getCode(), item.getName(), item.getDescription(), item.getIconUrl()))
                .toList();
    }
}
