package com.surveyflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.response.metadata.CategoryResponse;
import com.surveyflow.model.SurveyCategory;
import com.surveyflow.repository.SurveyCategoryRepository;
import com.surveyflow.service.SurveyCategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurveyCategoryServiceImpl implements SurveyCategoryService {

    private final SurveyCategoryRepository repository;

    @Override
    public List<CategoryResponse> getCategories() {
        return repository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(item -> new CategoryResponse(item.getId(), item.getName(), item.getSlug(), item.getDescription()))
                .toList();
    }
}
