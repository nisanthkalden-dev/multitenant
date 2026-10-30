package com.nexora.crm.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService, com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // If no Authorization header or doesn't start with Bearer, continue unauthenticated
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7).trim();

        try {
            // Strictly validate token: signature, expiration, and tokenType == ACCESS
            if (jwtService.validateAccessToken(token)) {
                String email = jwtService.extractEmail(token);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

                    if (userDetails instanceof CustomUserDetails customUser) {
                        // PART 3: If user belongs to a company that is currently suspended, immediately block access
                        if (customUser.getRole() != com.nexora.crm.entity.RoleType.SUPER_ADMIN && customUser.isCompanySuspended()) {
                            log.warn("Blocked request for user '{}' because company '{}' is suspended", email, customUser.getCompanyId());
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(org.springframework.http.MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            com.nexora.crm.dto.common.ApiResponse<Object> errorResponse = com.nexora.crm.dto.common.ApiResponse.error(
                                    "Your company account is suspended. Please contact the administrator.",
                                    HttpServletResponse.SC_FORBIDDEN
                            );
                            objectMapper.writeValue(response.getWriter(), errorResponse);
                            response.getWriter().flush();
                            return;
                        }

                        if (customUser.isEnabled()) {
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    customUser,
                                    null,
                                    customUser.getAuthorities()
                            );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                }
            } else {
                log.debug("Bearer token rejected by JwtAuthenticationFilter (invalid signature, expired, or not an ACCESS token)");
            }
        } catch (Exception ex) {
            log.warn("Authentication failed in JwtAuthenticationFilter: {}", ex.getMessage());
            // Clear context if any corrupted state
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
