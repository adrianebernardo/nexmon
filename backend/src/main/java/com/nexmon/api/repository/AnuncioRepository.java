package com.nexmon.api.repository;

import com.nexmon.api.model.Anuncio;
import com.nexmon.api.model.Modalidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Consultas por NOME DE MÉTODO. Como ler:
 *  findBy  AtivoTrue  And  CidadeIgnoreCase  And  Modalidade
 *  = "ativo é true E cidade (sem diferenciar maiúscula) E modalidade"
 */
public interface AnuncioRepository extends JpaRepository<Anuncio, Long> {

    List<Anuncio> findByAtivoTrueOrderByIdDesc();

    List<Anuncio> findByAtivoTrueAndModalidadeOrderByIdDesc(Modalidade modalidade);

    List<Anuncio> findByAtivoTrueAndCidadeIgnoreCaseOrderByIdDesc(String cidade);

    List<Anuncio> findByAtivoTrueAndCidadeIgnoreCaseAndModalidadeOrderByIdDesc(String cidade, Modalidade modalidade);
}
