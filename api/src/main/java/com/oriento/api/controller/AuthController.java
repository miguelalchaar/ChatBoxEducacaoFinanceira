package com.oriento.api.controller;

import com.oriento.api.dto.LoginRequest;
import com.oriento.api.dto.LoginResponse;
import com.oriento.api.dto.RefreshTokenDTO;
import com.oriento.api.model.RefreshToken;
import com.oriento.api.model.Usuario;
import com.oriento.api.repositories.UsuarioRepository;
import com.oriento.api.services.JwtService;
import com.oriento.api.services.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public AuthController(JwtService jwtService,
                          UsuarioRepository usuarioRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {

        var usuario = usuarioRepository.findByCnpj(loginRequest.cnpj());

        if (usuario.isEmpty() || !usuario.get().verificarLogin(loginRequest, passwordEncoder)) {
            throw new BadCredentialsException("CPNJ ou SENHA Inválidos!");
        }

        var accessToken = jwtService.gerarTokenJWT(usuario.get());
        var refreshToken = refreshTokenService.criarRefreshToken(usuario.get().getIdUsuario());

        return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken.getToken(), jwtService.getAccessTokenDuration()));

    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshTokenDTO refreshTokenDTO) {
        
        RefreshToken refreshToken = refreshTokenService.validarRefreshToken(refreshTokenDTO.refreshToken());
        Usuario usuario = refreshToken.getUsuario();
        
        // Gera novo access token
        var novoAccessToken = jwtService.gerarTokenJWT(usuario);
        
        return ResponseEntity.ok(new LoginResponse(novoAccessToken, refreshToken.getToken(), jwtService.getAccessTokenDuration()));
    }

}
