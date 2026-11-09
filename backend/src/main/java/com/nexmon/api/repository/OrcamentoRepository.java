package com.nexmon.api.repository;

import com.nexmon.api.model.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    // Só os métodos prontos (save, findById...) já bastam por enquanto.
}
