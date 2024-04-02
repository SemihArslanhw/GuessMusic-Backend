package com.semiharslanw.guessmusic.business.concretes;

import com.semiharslanw.guessmusic.business.abstracts.AuthService;
import com.semiharslanw.guessmusic.dtos.req.UserSigninRequest;
import com.semiharslanw.guessmusic.dtos.res.RefreshTokenResponse;
import com.semiharslanw.guessmusic.dtos.res.UserSigninResponse;
import com.semiharslanw.guessmusic.dtos.req.UserSignupRequest;
import com.semiharslanw.guessmusic.models.User;
import com.semiharslanw.guessmusic.repositories.UserRepository;
import com.semiharslanw.guessmusic.utils.JWTUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class AuthManager implements AuthService, UserDetailsService {

    private final UserRepository userRepository;

    private final JWTUtils jwtUtils;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;


    public AuthManager(UserRepository userRepository, JWTUtils jwtUtils, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findUserByUsername(username);
    }

    @Override
    public String signUp(UserSignupRequest userSignUpRequest) {
        try {
            User user = new User();
            user.setUsername(userSignUpRequest.getUsername());
            user.setPassword(passwordEncoder.encode(userSignUpRequest.getPassword()));
            user.setEmail(userSignUpRequest.getEmail());
            user.setRole(userSignUpRequest.getRole());
            userRepository.save(user);

            return "User created successfully";

        }catch (Exception e) {
            return "User could not be created";
        }
    }

    @Override
    public UserSigninResponse signIn(UserSigninRequest userSigninRequest) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userSigninRequest.getUsername(), userSigninRequest.getPassword()));
            var user = userRepository.findUserByUsername(userSigninRequest.getUsername());
            var token = jwtUtils.generateToken(user);
            var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);
            UserSigninResponse userSigninResponse = new UserSigninResponse();
            userSigninResponse.setAccess_token(token);
            userSigninResponse.setRefresh_token(refreshToken);
            userSigninResponse.setUsername(user.getUsername());
            userSigninResponse.setEmail(user.getEmail());
            userSigninResponse.setRole(user.getRole());
            return userSigninResponse;
        }catch (Exception e) {
            System.out.printf(e.getMessage());
            return null;
        }
    }

    @Override
    public RefreshTokenResponse refreshToken(String refreshToken) {
        String username = jwtUtils.extractUsername(refreshToken);
        var user = userRepository.findUserByUsername(username);
        if(jwtUtils.isTokenValid(refreshToken, user)) {
            RefreshTokenResponse refreshTokenResponse = new RefreshTokenResponse();
            refreshTokenResponse.setAccess_token(jwtUtils.generateToken(user));
            refreshTokenResponse.setRefresh_token(refreshToken);
            return refreshTokenResponse;
        }
        return null;
    }
}
