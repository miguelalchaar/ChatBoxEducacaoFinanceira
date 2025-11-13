package com.oriento.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração do SpringDoc OpenAPI (Swagger) para documentação da API.
 *
 * Esta classe configura a documentação interativa da API usando Swagger UI,
 * incluindo informações sobre autenticação JWT, endpoints disponíveis e
 * metadados do projeto.
 *
 * A documentação estará disponível em:
 * - Swagger UI: http://localhost:8080/swagger-ui.html
 * - OpenAPI JSON: http://localhost:8080/v3/api-docs
 *
 * @author Oriento Team
 * @version 1.0
 * @since 2025
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.name:OrientoAPI}")
    private String applicationName;

    /**
     * Configura o bean OpenAPI com todas as informações da documentação da API.
     *
     * Define:
     * - Metadados da API (título, descrição, versão, licença, contato)
     * - Servidores disponíveis
     * - Esquema de segurança JWT Bearer Token
     * - Requisito de segurança global para todos os endpoints
     *
     * @return Objeto OpenAPI configurado
     */
    @Bean
    public OpenAPI customOpenAPI() {
        // Nome do esquema de segurança usado na API
        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()
                // Informações gerais da API
                .info(new Info()
                        .title("Oriento API - Educação Financeira para PMEs")
                        .description("""
                                API REST para plataforma de educação financeira empresarial.

                                ## Funcionalidades Principais

                                - **Autenticação JWT**: Sistema seguro com access e refresh tokens
                                - **Assistente Virtual Oriento**: IA especializada em educação financeira usando Google Gemini
                                - **Gestão de Usuários**: Cadastro, perfil e autenticação
                                - **Rate Limiting**: Proteção contra ataques de força bruta

                                ## Como Usar

                                1. Registre-se através do endpoint `/api/auth/register`
                                2. Faça login no endpoint `/api/auth/login` para obter o JWT token
                                3. Clique no botão "Authorize" acima e insira o token no formato: `Bearer seu_token_aqui`
                                4. Agora você pode testar todos os endpoints protegidos

                                ## Autenticação

                                A API utiliza JWT (JSON Web Tokens) com criptografia RSA para autenticação.
                                O access token expira em 15 minutos, mas você pode renová-lo usando o refresh token.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipe Oriento")
                                .email("contato@oriento.com")
                                .url("https://github.com/seu-usuario/ChatBoxEducacaoFinanceira"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))

                // Servidores disponíveis
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor de Desenvolvimento"),
                        new Server()
                                .url("https://api.oriento.com")
                                .description("Servidor de Produção (Planejado)")
                ))

                // Configuração de segurança JWT
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("""
                                        Insira o JWT token obtido através do endpoint `/api/auth/login`.

                                        **Formato**: Bearer {seu_token_aqui}

                                        **Exemplo**: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

                                        O token expira em 15 minutos. Use o endpoint `/api/auth/refresh` para renová-lo.
                                        """)))

                // Aplica autenticação JWT como requisito global para todos os endpoints
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName));
    }
}
