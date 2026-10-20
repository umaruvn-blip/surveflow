package com.surveyflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.response.metadata.TagResponse;
import com.surveyflow.model.SurveyTag;
import com.surveyflow.repository.SurveyTagRepository;
import com.surveyflow.service.SurveyTagService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurveyTagServiceImpl implements SurveyTagService {

    private final SurveyTagRepository repository;

    @Override
    public List<TagResponse> getTags() {
        return repository.findAllByOrderByNameAsc().stream()
                .map(item -> new TagResponse(item.getId(), item.getName(), item.getSlug()))
                .toList();
    }
}
