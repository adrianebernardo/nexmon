package com.nexmon.api.controller;

import com.nexmon.api.dto.OrcamentoRequest;
import com.nexmon.api.dto.OrcamentoResponse;
import com.nexmon.api.service.OrcamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoController {

    private final OrcamentoService service;

    public OrcamentoController(OrcamentoService service) {
        this.service = service;
    }

    // POST /api/orcamentos -> solicitar orçamento a um prestador
    @PostMapping
    public ResponseEntity<OrcamentoResponse> solicitar(@Valid @RequestBody OrcamentoRequest dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dados));
    }
}
