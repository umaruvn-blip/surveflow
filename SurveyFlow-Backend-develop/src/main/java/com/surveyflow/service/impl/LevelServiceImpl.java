package com.surveyflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.response.metadata.LevelResponse;
import com.surveyflow.model.Level;
import com.surveyflow.repository.LevelRepository;
import com.surveyflow.service.LevelService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LevelServiceImpl implements LevelService {

    private final LevelRepository repository;

    @Override
    public List<LevelResponse> getLevels() {
        return repository.findAllByOrderByLevelNumberAsc().stream()
                .map(item -> new LevelResponse(item.getId(), item.getLevelNumber(), item.getName(), item.getMinXp()))
                .toList();
    }
}
