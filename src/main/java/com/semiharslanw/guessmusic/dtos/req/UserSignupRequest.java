package com.semiharslanw.guessmusic.dtos.req;

import com.semiharslanw.guessmusic.models.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSignupRequest {
    private String username;
    private String password;
    private String email;
    private Role role;
}
