package com.surveyflow.security.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    /**
     * SecretKey là key HMAC đã được tạo từ chuỗi secret cấu hình.
     * JJWT dùng object này để ký token khi generate và verify chữ ký khi parse token.
     */
    private final SecretKey accessTokenSigningKey;
    private final SecretKey refreshTokenSigningKey;

    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    public JwtService(@Value("${app.jwt.access-token-secret}") String accessTokenSecret,
                      @Value("${app.jwt.refresh-token-secret}") String refreshTokenSecret,
                      @Value("${app.jwt.access-token-expiration-ms}") long accessTokenExpirationMs,
                      @Value("${app.jwt.refresh-token-expiration-ms}") long refreshTokenExpirationMs) {
        this.accessTokenSigningKey = buildSigningKey(accessTokenSecret);
        this.refreshTokenSigningKey = buildSigningKey(refreshTokenSecret);
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    /** Xác minh access token và lấy toàn bộ claims. */
    public Claims extractAllClaims(String token) {
        return extractAllClaims(token, accessTokenSigningKey);
    }

    /** Xác minh refresh token và lấy toàn bộ claims. */
    public Claims extractAllRefreshTokenClaims(String token) {
        return extractAllClaims(token, refreshTokenSigningKey);
    }

    /** Tạo access token đã ký cho subject và claims. */
    public String generateAccessToken(String subject, Map<String, Object> claims) {
        return generateToken(subject, claims, accessTokenExpirationMs, accessTokenSigningKey);
    }

    /** Tạo refresh token đã ký cho subject và claims. */
    public String generateRefreshToken(String subject, Map<String, Object> claims) {
        return generateToken(subject, claims, refreshTokenExpirationMs, refreshTokenSigningKey);
    }

    /** Kiểm tra access token đã hết hạn hay chưa. */
    public boolean isTokenExpired(String token) {
        return isTokenExpired(token, accessTokenSigningKey);
    }

    /** Kiểm tra refresh token đã hết hạn hay chưa. */
    public boolean isRefreshTokenExpired(String token) {
        return isTokenExpired(token, refreshTokenSigningKey);
    }

    /** Lấy thời hạn cấu hình của refresh token theo millisecond. */
    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpirationMs;
    }

    /** Xác minh và parse JWT bằng signing key tương ứng. */
    private Claims extractAllClaims(String token, SecretKey signingKey) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /** Tạo JWT đã ký với loại key và thời hạn tương ứng. */
    private String generateToken(String subject,
                                 Map<String, Object> claims,
                                 long expirationMs,
                                 SecretKey signingKey) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setId(UUID.randomUUID().toString())
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(signingKey)
                .compact();
    }

    private boolean isTokenExpired(String token, SecretKey signingKey) {
        Date expiration = extractAllClaims(token, signingKey).getExpiration();
        return expiration != null && expiration.before(new Date());
    }

    /** Tạo signing key từ secret dạng Base64 hoặc chuỗi thường. */
    private SecretKey buildSigningKey(String secret) {
        try {
            byte[] decoded = Decoders.BASE64.decode(secret);
            return Keys.hmacShaKeyFor(decoded);
        } catch (IllegalArgumentException ex) {
            byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
            return Keys.hmacShaKeyFor(raw);
        }
    }
}
