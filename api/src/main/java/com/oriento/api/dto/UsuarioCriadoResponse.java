package com.oriento.api.dto;

public record UsuarioCriadoResponse(
        String message
) {
    public static UsuarioCriadoResponse of() {
        return new UsuarioCriadoResponse(
                "Usuário criado com sucesso."
        );
    }
    
    public static UsuarioCriadoResponse erroJaCadastrado() {
        return new UsuarioCriadoResponse(
                "Email ou CNPJ já cadastrado."
        );
    }

    public static UsuarioCriadoResponse campoInvalido(String message) {
        return new UsuarioCriadoResponse(message);
    }

}

