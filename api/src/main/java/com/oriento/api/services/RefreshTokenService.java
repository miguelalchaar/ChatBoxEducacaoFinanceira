package com.oriento.api.services;

import com.oriento.api.model.RefreshToken;
import com.oriento.api.model.Usuario;
import com.oriento.api.repositories.RefreshTokenRepository;
import com.oriento.api.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Duração do refresh token: 15 dias
    private static final long REFRESH_TOKEN_DURATION = 1296000L; // 15 * 24 * 60 * 60 segundos

    @Transactional
    public RefreshToken criarRefreshToken(UUID userId) {
        RefreshToken refreshToken = new RefreshToken();
        
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        refreshToken.setUsuario(usuario);
        refreshToken.setExpiryDate(Instant.now().plusSeconds(REFRESH_TOKEN_DURATION));
        refreshToken.setToken(UUID.randomUUID().toString());
        
        // Remove token antigo se existir
        refreshTokenRepository.findByUsuario(usuario).ifPresent(refreshTokenRepository::delete);
        
        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    public RefreshToken validarRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .filter(this::verificarExpiracao)
                .orElseThrow(() -> new RuntimeException("Refresh Token inválido ou expirado"));
    }

    @Transactional
    public void deletarRefreshToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }

    private boolean verificarExpiracao(RefreshToken token) {
        return token.getExpiryDate().compareTo(Instant.now()) > 0;
    }
}

