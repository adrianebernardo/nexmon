package com.nexmon.api.repository;

import com.nexmon.api.model.Selo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeloRepository extends JpaRepository<Selo, Long> {

    // Selos de um usuário, do mais novo para o mais antigo.
    List<Selo> findByUsuarioIdOrderByDataConcessaoDesc(Long usuarioId);

    // Evita dar o mesmo selo duas vezes.
    boolean existsByUsuarioIdAndNomeBadge(Long usuarioId, String nomeBadge);
}
