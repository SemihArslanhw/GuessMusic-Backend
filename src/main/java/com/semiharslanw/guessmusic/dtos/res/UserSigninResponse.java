package com.semiharslanw.guessmusic.dtos.res;

import com.semiharslanw.guessmusic.models.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSigninResponse {
    private String access_token;
    private String refresh_token;
    private String username;
    private String email;
    private Role role;
}
