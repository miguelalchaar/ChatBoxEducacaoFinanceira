package com.oriento.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarUsuarioDTO(
        @NotBlank(message = "O nome é obrigatório.")
        String nome,
        @NotBlank(message = "O CNPJ é obrigatório.")
        @Size(min = 14, message = "O CNPJ deve conter pelo menos 14 caracteres.")
        String cnpj,
        @NotBlank(message = "O email é obrigatório.")
        @Email
        String email,
        String razaoSocial,
        String nomeFantasia,
        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, message = "A senha deve conter pelo menos 8 caracteres.")
        String senha
) {}
