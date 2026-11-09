package com.nexmon.api.controller;

import com.nexmon.api.dto.SeloResponse;
import com.nexmon.api.service.SeloService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/selos")
public class SeloController {

    private final SeloService service;

    public SeloController(SeloService service) {
        this.service = service;
    }

    // GET /api/selos/usuario/1 -> selos do perfil do prestador
    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<SeloResponse>> listarPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarPorUsuario(id));
    }
}
