package com.semiharslanw.guessmusic.business.abstracts;

import com.semiharslanw.guessmusic.dtos.req.UserSigninRequest;
import com.semiharslanw.guessmusic.dtos.res.RefreshTokenResponse;
import com.semiharslanw.guessmusic.dtos.res.UserSigninResponse;
import com.semiharslanw.guessmusic.dtos.req.UserSignupRequest;

public interface AuthService {
    String signUp(UserSignupRequest userSignUpRequest);
    UserSigninResponse signIn(UserSigninRequest userSigninRequest);

    RefreshTokenResponse refreshToken(String refreshToken);
}
