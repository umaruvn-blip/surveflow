package com.surveyflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.response.metadata.InterestResponse;
import com.surveyflow.model.Interest;
import com.surveyflow.repository.InterestRepository;
import com.surveyflow.service.InterestService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterestServiceImpl implements InterestService {

    private final InterestRepository repository;

    @Override
    public List<InterestResponse> getInterests() {
        return repository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(item -> new InterestResponse(item.getId(), item.getName(), item.getSlug(), item.getDescription()))
                .toList();
    }
}
