package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.dto.TaxCalculationRequestDto;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;
import com.shelly.freelancetaxmanager.service.TaxService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
// @RequestMapping sets a URL prefix for all routes in this class.
// Every endpoint here starts with /api/tax.
@RequestMapping("/api/tax")
public class TaxController {

    private final TaxService taxService; //the controller DEPENDS on tne service

    //Spring passes in the TaxService it already created.
    public TaxController(TaxService taxService) {
        this.taxService = taxService;
    }

    // Handles POST requests to /api/tax/calculate.
    //POST because we're sending data in the body of the request, and because it will log calculation to a database
    @PostMapping("/calculate")
    public ResponseEntity<TaxCalculationResponseDto> calculate(
            // @Valid = triggers validation of the DTO's annotations (@NotNull, @Positive, etc.)
            // before the method body runs. If validation fails, Spring returns HTTP 400
            //
            // @RequestBody = tells Spring to read the JSON body of the HTTP request and make it into a TaxCalculationRequestDto object
            @Valid @RequestBody TaxCalculationRequestDto request
    ) {
        return ResponseEntity.ok(taxService.calculateTax(request));
    }
}
