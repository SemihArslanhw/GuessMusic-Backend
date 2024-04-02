package com.semiharslanw.guessmusic.controllers;

import com.semiharslanw.guessmusic.business.concretes.AuthManager;
import com.semiharslanw.guessmusic.dtos.req.UserSigninRequest;
import com.semiharslanw.guessmusic.dtos.req.UserSignupRequest;
import com.semiharslanw.guessmusic.dtos.res.RefreshTokenResponse;
import com.semiharslanw.guessmusic.dtos.res.UserSigninResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthManager authManager;


    public AuthController(AuthManager authManager) {
        this.authManager = authManager;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserSignupRequest userSignupRequest) {
        return ResponseEntity.ok(authManager.signUp(userSignupRequest));
    }

    @PostMapping("/signin")
    public ResponseEntity<UserSigninResponse> signup(@RequestBody UserSigninRequest userSigninRequest, HttpServletResponse response) {
        UserSigninResponse userSigninResponse = authManager.signIn(userSigninRequest);
        Cookie access_cookie = new Cookie("access_token", userSigninResponse.getAccess_token());
        access_cookie.setMaxAge(86400);
        access_cookie.setPath("/");
        Cookie refresh_cookie = new Cookie("refresh_token", userSigninResponse.getRefresh_token());
        refresh_cookie.setMaxAge(864000);
        refresh_cookie.setPath("/");
        response.addCookie(access_cookie);

        return ResponseEntity.ok(userSigninResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody String refreshToken) {
        return ResponseEntity.ok(authManager.refreshToken(refreshToken));
    }
}
