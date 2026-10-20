package com.surveyflow.model.id;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserInterestId implements Serializable {

    private Long user;

    private Long interest;
}
