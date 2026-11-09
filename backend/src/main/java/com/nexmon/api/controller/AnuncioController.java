package com.nexmon.api.controller;

import com.nexmon.api.dto.AnuncioRequest;
import com.nexmon.api.dto.AnuncioResponse;
import com.nexmon.api.model.Modalidade;
import com.nexmon.api.service.AnuncioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anuncios")
public class AnuncioController {

    private final AnuncioService service;

    public AnuncioController(AnuncioService service) {
        this.service = service;
    }

    // POST /api/anuncios -> criar anúncio
    @PostMapping
    public ResponseEntity<AnuncioResponse> criar(@Valid @RequestBody AnuncioRequest dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dados));
    }

    // GET /api/anuncios?cidade=Canoas&modalidade=ALUGUEL
    // @RequestParam = parâmetro da URL (depois do "?"). required=false = opcional.
    @GetMapping
    public ResponseEntity<List<AnuncioResponse>> listar(
            @RequestParam(required = false) String cidade,
            @RequestParam(required = false) Modalidade modalidade) {
        return ResponseEntity.ok(service.listar(cidade, modalidade));
    }

    // GET /api/anuncios/1 -> detalhes e fotos (funcionalidade âncora)
    @GetMapping("/{id}")
    public ResponseEntity<AnuncioResponse> detalhes(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }
}
