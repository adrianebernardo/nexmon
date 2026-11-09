package com.nexmon.api.repository;

import com.nexmon.api.model.Reserva;
import com.nexmon.api.model.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Reservas que o usuário FEZ (ele é o locatário/"renter").
    List<Reserva> findByUsuarioRenterId(Long usuarioId);

    // Reservas de um anúncio que ainda seguram datas (usado para montar o calendário).
    List<Reserva> findByAnuncioIdAndStatusIn(Long anuncioId, List<StatusReserva> status);

    // Reservas que o usuário RECEBEU (ele é o dono do anúncio reservado).
    List<Reserva> findByAnuncioUsuarioId(Long usuarioId);

    /**
     * Conta reservas do mesmo anúncio que BATEM com o período pedido.
     * Dois períodos se sobrepõem quando:  inicioA <= fimB  E  fimA >= inicioB
     * Só considera os status passados (CANCELADA/CONCLUIDA não bloqueiam).
     * Quando a regra é complicada demais para o nome do método, usamos @Query (JPQL).
     */
    @Query("select count(r) from Reserva r "
         + "where r.anuncio.id = :anuncioId "
         + "and r.status in :statusLista "
         + "and r.dataInicio <= :fim "
         + "and r.dataFim >= :inicio")
    long contarConflitos(@Param("anuncioId") Long anuncioId,
                         @Param("inicio") LocalDate inicio,
                         @Param("fim") LocalDate fim,
                         @Param("statusLista") List<StatusReserva> statusLista);
}
