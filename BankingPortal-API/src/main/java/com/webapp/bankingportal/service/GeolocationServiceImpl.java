package com.webapp.bankingportal.service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.webapp.bankingportal.dto.GeolocationResponse;
import com.webapp.bankingportal.exception.GeolocationException;

import lombok.val;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GeolocationServiceImpl implements GeolocationService {

    @Value("${geo.api.url}")
    private String apiUrl;

    @Value("${geo.api.key}")
    private String apiKey;

    @Override
    @Async
    public CompletableFuture<GeolocationResponse> getGeolocation(String ip) {
        val future = new CompletableFuture<GeolocationResponse>();

        try {
            // If the IP is local, fetch the public IP
            if ("0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip)) {
                log.info("Detected local IP, fetching public IP...");
                ip = getPublicIp();
                if ("UNKNOWN".equals(ip)) {
                    throw new GeolocationException("Could not determine public IP.");
                }
            }

            log.info("Getting geolocation for IP: {}", ip);

            // Call geolocation API
            val url = String.format("%s/%s/json?token=%s", apiUrl, ip, apiKey);
            val response = new RestTemplate().getForObject(url, GeolocationResponse.class);

            if (response == null) {
                log.error("Failed to get geolocation for IP: {}", ip);
                future.completeExceptionally(new GeolocationException(
                        "Failed to get geolocation for IP: " + ip));
            } else {
                future.complete(response);
            }

        } catch (RestClientException e) {
            log.error("Failed to get geolocation for IP: {}", ip, e);
            future.completeExceptionally(e);
        }

        return future;
    }

    /**
     * Fetches the public IP of the server using an external API.
     */
    private String getPublicIp() {
        try {
            RestTemplate restTemplate = new RestTemplate();
           // String url = "https://api64.ipify.org?format=json";
            String url ="https://ipinfo.io/json";
            val response = restTemplate.getForObject(url, java.util.Map.class);
            return response != null ? response.get("ip").toString() : "UNKNOWN";
        } catch (Exception e) {
            log.error("Failed to fetch public IP", e);
            return "UNKNOWN";
        }
    }
}
