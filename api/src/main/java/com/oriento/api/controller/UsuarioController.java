package com.oriento.api.controller;

import com.oriento.api.dto.CriarUsuarioDTO;
import com.oriento.api.dto.UsuarioCriadoResponse;
import com.oriento.api.model.Usuario;
import com.oriento.api.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioCriadoResponse> novoUsuario(@Valid @RequestBody CriarUsuarioDTO dto) {
        var usuarioExisteCNPJ = usuarioRepository.findByCnpj(dto.cnpj());
        var usuarioExisteEMAIL = usuarioRepository.findByEmail(dto.email());
        if(usuarioExisteEMAIL.isPresent() || usuarioExisteCNPJ.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(UsuarioCriadoResponse.erroJaCadastrado());
        }
        var usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setCnpj(dto.cnpj());
        usuario.setRazaoSocial(dto.razaoSocial());
        usuario.setNomeFantasia(dto.nomeFantasia());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(UsuarioCriadoResponse.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<UsuarioCriadoResponse> handleValidationException(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors();
        var errorMessage = errors.stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Dados inválidos fornecidos.");
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(UsuarioCriadoResponse.campoInvalido(errorMessage));
    }

}
