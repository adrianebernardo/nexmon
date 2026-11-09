package com.nexmon.api.controller;

import com.nexmon.api.dto.LoginRequest;
import com.nexmon.api.dto.UsuarioResponse;
import com.nexmon.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService service;

    public AuthController(UsuarioService service) {
        this.service = service;
    }

    // POST /api/auth/login -> devolve o usuário (sem senha) se e-mail e senha conferem; 401 se não
    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> entrar(@Valid @RequestBody LoginRequest dados) {
        return ResponseEntity.ok(service.autenticar(dados));
    }
}
