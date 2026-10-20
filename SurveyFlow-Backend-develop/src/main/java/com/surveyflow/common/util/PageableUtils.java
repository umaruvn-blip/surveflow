package com.surveyflow.common.util;

import java.util.Set;
import java.util.function.Function;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.surveyflow.dto.response.PageResponse;

public final class PageableUtils {

    private static final Sort.Direction DEFAULT_SORT_DIRECTION = Sort.Direction.DESC;

    private PageableUtils() {
    }

    /** Tạo pageable từ số trang 1-based và field sort đã được kiểm soát. */
    public static Pageable buildPageable(
            int page,
            int size,
            String sortBy,
            String sortDir,
            String defaultSortBy,
            Set<String> sortableFields) {
        int pageNumber = page > 0 ? page - 1 : 0;
        String safeSortBy = sortBy != null && sortableFields.contains(sortBy)
                ? sortBy
                : defaultSortBy;
        Sort.Direction direction = Sort.Direction.fromOptionalString(sortDir)
                .orElse(DEFAULT_SORT_DIRECTION);
        return PageRequest.of(pageNumber, size, Sort.by(direction, safeSortBy));
    }

    /** Chuyển Spring Data page sang response phân trang của API. */
    public static <T, R> PageResponse<R> toPageResponse(Page<T> page, Function<T, R> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
