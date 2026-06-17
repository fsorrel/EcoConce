package cl.ecoconce.controller;

import cl.ecoconce.dto.GuiaDto;
import cl.ecoconce.repository.GuiaReciclajeRepository;
import cl.ecoconce.service.MapperService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Transactional(readOnly = true)
@RequestMapping("/api/guias")
public class GuiaController {
    private final GuiaReciclajeRepository guiaRepository;
    private final MapperService mapper;

    @GetMapping
    public List<GuiaDto> listar() {
        return guiaRepository.findAll().stream().map(mapper::toGuia).toList();
    }


    public GuiaController(GuiaReciclajeRepository guiaRepository, MapperService mapper) {
        this.guiaRepository = guiaRepository;
        this.mapper = mapper;
    }
}
