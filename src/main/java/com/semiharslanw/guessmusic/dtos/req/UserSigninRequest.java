package com.semiharslanw.guessmusic.dtos.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSigninRequest {
    private String username;
    private String password;
}
