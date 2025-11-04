package com.oriento.api.services;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.oriento.api.model.Usuario;

import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    @Autowired
    private RSAPrivateKey privateKey;

    // Duração do access token: 15 minutos (melhor prática de segurança)
    private static final long ACCESS_TOKEN_DURATION = 900L; // 15 * 60 segundos

    public String gerarTokenJWT(Usuario usuario) {
        var now = Instant.now();

        var token = Jwts.builder()
                .issuer("oriento")
                .subject(usuario.getIdUsuario().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ACCESS_TOKEN_DURATION)))
                .signWith(privateKey)
                .compact();

        return token;
    }

    public Long getAccessTokenDuration() {
        return ACCESS_TOKEN_DURATION;
    }

}
