package com.nexmon.api.controller;

import com.nexmon.api.dto.UsuarioRequest;
import com.nexmon.api.dto.UsuarioResponse;
import com.nexmon.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * CONTROLLER = a "porta de entrada" HTTP (o garçom).
 * Ele NÃO tem regras: só recebe o pedido, chama o service e devolve a resposta.
 */
@RestController                    // responde em JSON
@RequestMapping("/api/usuarios")   // endereço base de tudo desta classe
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // POST /api/usuarios  -> cadastrar
    // @RequestBody: transforma o JSON recebido no objeto UsuarioRequest
    // @Valid: roda as validações (@NotBlank, @Email...) antes de entrar no método
    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrar(@Valid @RequestBody UsuarioRequest dados) {
        UsuarioResponse criado = service.cadastrar(dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);   // 201
    }

    // GET /api/usuarios/1  -> buscar perfil
    // @PathVariable: pega o {id} que veio na URL
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));   // 200
    }
}
