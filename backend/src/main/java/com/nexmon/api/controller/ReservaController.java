package com.nexmon.api.controller;

import com.nexmon.api.dto.ReservaRequest;
import com.nexmon.api.dto.ReservaResponse;
import com.nexmon.api.dto.ReservaStatusRequest;
import com.nexmon.api.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    // POST /api/reservas -> solicitar reserva (valida as datas no service)
    @PostMapping
    public ResponseEntity<ReservaResponse> solicitar(@Valid @RequestBody ReservaRequest dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dados));
    }

    // PATCH /api/reservas/5/status -> o dono do anúncio aprova ou recusa
    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservaResponse> responder(@PathVariable Long id,
                                                     @Valid @RequestBody ReservaStatusRequest dados) {
        return ResponseEntity.ok(service.atualizarStatus(id, dados));
    }

    // GET /api/reservas/usuario/1 -> reservas feitas E recebidas pelo usuário
    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<ReservaResponse>> listarPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarPorUsuario(id));
    }
}
