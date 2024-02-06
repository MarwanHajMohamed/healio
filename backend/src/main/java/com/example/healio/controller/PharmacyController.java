package com.example.healio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class PharmacyController {

    private final String GOOGLE_MAPS_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    private final String API_KEY = "AIzaSyAyG__u86ryIEaUNq5pRYRuIv5iBCUBsiU"; // Replace with your actual API key

    @GetMapping("/pharmacies")
    public ResponseEntity<String> getPharmacies(@RequestParam double lat, @RequestParam double lng) {
        String url = String.format("%s?location=%f,%f&radius=5000&type=pharmacy&key=%s",
                GOOGLE_MAPS_API_URL, lat, lng, API_KEY);

        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.getForObject(url, String.class);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/gp")
    public ResponseEntity<String> getGPs(@RequestParam double lat, @RequestParam double lng) {
        String url = String.format("%s?location=%f,%f&radius=5000&keyword=gp&key=%s",
                GOOGLE_MAPS_API_URL, lat, lng, API_KEY);

        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.getForObject(url, String.class);

        return ResponseEntity.ok(result);
    }
}
