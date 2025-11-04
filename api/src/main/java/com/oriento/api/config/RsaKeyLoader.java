package com.oriento.api.config;

import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.InputStreamReader;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

@Configuration
public class RsaKeyLoader {

    @Value("${jwt.public.key}")
    private Resource publicKeyResource;

    @Value("${jwt.private.key}")
    private Resource privateKeyResource;

    @Bean
    public RSAPublicKey publicKey() throws Exception {
        return loadPublicKey(publicKeyResource);
    }

    @Bean
    public RSAPrivateKey privateKey() throws Exception {
        return loadPrivateKey(privateKeyResource);
    }

    private RSAPublicKey loadPublicKey(Resource resource) throws Exception {
        try (PEMParser pemParser = new PEMParser(new InputStreamReader(resource.getInputStream()))) {
            SubjectPublicKeyInfo publicKeyInfo = (SubjectPublicKeyInfo) pemParser.readObject();
            JcaPEMKeyConverter converter = new JcaPEMKeyConverter();
            return (RSAPublicKey) converter.getPublicKey(publicKeyInfo);
        }
    }

    private RSAPrivateKey loadPrivateKey(Resource resource) throws Exception {
        try (PEMParser pemParser = new PEMParser(new InputStreamReader(resource.getInputStream()))) {
            PrivateKeyInfo privateKeyInfo = (PrivateKeyInfo) pemParser.readObject();
            JcaPEMKeyConverter converter = new JcaPEMKeyConverter();
            return (RSAPrivateKey) converter.getPrivateKey(privateKeyInfo);
        }
    }
}

