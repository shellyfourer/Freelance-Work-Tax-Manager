package com.shelly.freelancetaxmanager.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TaxController {

    @GetMapping("/api/tax/test")
    public String test() {
        return "Tax API is running";
    }
}