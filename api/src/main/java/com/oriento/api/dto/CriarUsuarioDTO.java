package com.oriento.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CriarUsuarioDTO(
        @NotBlank(message = "O nome é obrigatório.")
        String nome,
        @NotBlank(message = "O CNPJ é obrigatório.")
        String cnpj,
        @NotBlank(message = "O email é obrigatório.")
        String email,
        String razaoSocial,
        String nomeFantasia,
        @NotBlank(message = "A senha é obrigatória.")
        String senha
) {}
