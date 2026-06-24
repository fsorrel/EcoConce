package cl.ecoconce.controller;

import cl.ecoconce.dto.MaterialDto;
import cl.ecoconce.repository.MaterialRepository;
import cl.ecoconce.service.MapperService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Transactional(readOnly = true)
@RequestMapping("/api/materiales")
public class MaterialController {
    private final MaterialRepository materialRepository;
    private final MapperService mapper;

    @GetMapping
    public List<MaterialDto> listar() {
        return materialRepository.findAll().stream().map(mapper::toMaterial).toList();
    }


    public MaterialController(MaterialRepository materialRepository, MapperService mapper) {
        this.materialRepository = materialRepository;
        this.mapper = mapper;
    }
}
