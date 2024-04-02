package com.semiharslanw.guessmusic.config;

import com.semiharslanw.guessmusic.business.concretes.AuthManager;
import com.semiharslanw.guessmusic.utils.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    private final JWTUtils jwtUtils;

    private final AuthManager authManager;

    public JWTAuthFilter(JWTUtils jwtUtils, AuthManager authManager) {
        this.jwtUtils = jwtUtils;
        this.authManager = authManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        String jwtToken;
        String username;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("access_token")) {
                    jwtToken = cookie.getValue();
                    username = jwtUtils.extractUsername(jwtToken);
                    if(username != null && SecurityContextHolder.getContext().getAuthentication() != null) {
                        UserDetails userDetails = authManager.loadUserByUsername(username);
                        if(jwtUtils.isTokenValid(jwtToken, userDetails)) {
                            SecurityContext context = SecurityContextHolder.createEmptyContext();
                            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                            token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            context.setAuthentication(token);
                            SecurityContextHolder.setContext(context);
                        }
                    }
                }
            }
        }
            filterChain.doFilter(request, response);
            return;
    }
}
