package com.nexora.crm.security;

import com.nexora.crm.entity.RoleType;
import com.nexora.crm.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    public static final String CLAIM_TOKEN_TYPE = "tokenType";
    public static final String CLAIM_USER_ID = "userId";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_COMPANY_ID = "companyId";
    public static final String TOKEN_TYPE_ACCESS = "ACCESS";
    public static final String TOKEN_TYPE_REFRESH = "REFRESH";

    @Value("${jwt.access.secret:${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}}")
    private String accessSecret;

    @Value("${jwt.refresh.secret:5367566B5970337336763979244226452948404D6351655468576D5A71347437}")
    private String refreshSecret;

    @Value("${jwt.access.expiration-ms:900000}")
    private long accessExpirationMs; // Default 15 minutes = 900,000 ms

    @Value("${jwt.refresh.expiration-ms:604800000}")
    private long refreshExpirationMs; // Default 7 days = 604,800,000 ms

    /**
     * Generate an ACCESS token with tokenType = ACCESS
     * For SUPER_ADMIN: companyId is null/omitted.
     * For Company users: companyId is populated.
     */
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS);
        claims.put(CLAIM_USER_ID, user.getId());
        claims.put("userIdentifier", user.getUserId());
        claims.put("fullName", user.getFullName());
        claims.put(CLAIM_EMAIL, user.getEmail());
        claims.put(CLAIM_ROLE, user.getRole().name());

        if (user.getRole() != RoleType.SUPER_ADMIN && user.getCompany() != null) {
            claims.put(CLAIM_COMPANY_ID, user.getCompany().getId());
            claims.put("companyName", user.getCompany().getName());
            claims.put("workspace", user.getCompany().getWorkspace());
        } else {
            claims.put(CLAIM_COMPANY_ID, null);
        }

        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessExpirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail()) // standard subject = email
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getAccessSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generate a long-lived REFRESH token with tokenType = REFRESH
     * Contains only userId, tokenType, iat, exp and subject.
     * Signed with dedicated refresh key.
     */
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH);
        claims.put(CLAIM_USER_ID, user.getId());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshExpirationMs);

        return Jwts.builder()
                .id(java.util.UUID.randomUUID().toString())
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getRefreshSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // Access Token Validation
    public boolean validateAccessToken(String token) {
        try {
            Claims claims = extractAllAccessClaims(token);
            String tokenType = claims.get(CLAIM_TOKEN_TYPE, String.class);
            if (!TOKEN_TYPE_ACCESS.equalsIgnoreCase(tokenType)) {
                log.warn("Access token rejected: tokenType claim is '{}' instead of '{}'", tokenType, TOKEN_TYPE_ACCESS);
                return false;
            }
            return !isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Access token validation failed: {}", e.getMessage());
            return false;
        }
    }

    // Refresh Token Validation
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = extractAllRefreshClaims(token);
            String tokenType = claims.get(CLAIM_TOKEN_TYPE, String.class);
            if (!TOKEN_TYPE_REFRESH.equalsIgnoreCase(tokenType)) {
                log.warn("Refresh token rejected: tokenType claim is '{}' instead of '{}'", tokenType, TOKEN_TYPE_REFRESH);
                return false;
            }
            return !isTokenExpired(claims);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public Claims extractAllAccessClaims(String token) {
        return Jwts.parser()
                .verifyWith(getAccessSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Claims extractAllRefreshClaims(String token) {
        return Jwts.parser()
                .verifyWith(getRefreshSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractAccessClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllAccessClaims(token);
        return claimsResolver.apply(claims);
    }

    public <T> T extractRefreshClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllRefreshClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractEmail(String token) {
        return extractAccessClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        return extractAccessClaim(token, claims -> {
            Object id = claims.get(CLAIM_USER_ID);
            if (id instanceof Number num) return num.longValue();
            if (id instanceof String str) return Long.parseLong(str);
            return null;
        });
    }

    public String extractRole(String token) {
        return extractAccessClaim(token, claims -> claims.get(CLAIM_ROLE, String.class));
    }

    public String extractCompanyId(String token) {
        return extractAccessClaim(token, claims -> claims.get(CLAIM_COMPANY_ID, String.class));
    }

    public String extractRefreshSubject(String token) {
        return extractRefreshClaim(token, Claims::getSubject);
    }

    public Long extractRefreshUserId(String token) {
        return extractRefreshClaim(token, claims -> {
            Object id = claims.get(CLAIM_USER_ID);
            if (id instanceof Number num) return num.longValue();
            if (id instanceof String str) return Long.parseLong(str);
            return null;
        });
    }

    public boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    public long getAccessExpirationSeconds() {
        return accessExpirationMs / 1000;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    /**
     * Compute SHA-256 hash of raw refresh token for safe database persistence and verification.
     */
    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private SecretKey getAccessSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(accessSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private SecretKey getRefreshSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(refreshSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
