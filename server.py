#!/usr/bin/env python3
"""
VOLTX AETHER-01 PRO - Showcase Development & Telemetry API Server
GDG on Campus SRM Recruitments 2026-27 (Technical Domain)
"""

import http.server
import json
import mimetypes
import os
import sys
import time

PORT = int(os.environ.get("PORT", 8000))
HOST = "0.0.0.0"

PRODUCT_VARIANTS = {
    "solar-sunset": {
        "id": "solar-sunset",
        "name": "Solar Sunset",
        "finish": "Anodized Sunset Copper & High-Density Acoustic Resin",
        "tagline": "Warm Acoustic Resonance & Twilight Precision",
        "description": "Inspired by high-voltage twilight atmospheres. Tuned for lush harmonic warmth, analog vinyl clarity, and rich deep bass response with custom beryllium drivers.",
        "soundProfile": "Warm Harmonic Master tuning with enhanced dynamic range.",
        "accentColor": "#ff7e29",
        "glowRgb": [255, 126, 41],
        "specs": {
            "latency": "1.1 ms",
            "playtime": "68 hrs",
            "frequency": "4 Hz - 50 kHz",
            "anc": "-46 dB",
            "driverSize": "50mm",
            "weightGrams": 285
        }
    },
    "obsidian-cyan": {
        "id": "obsidian-cyan",
        "name": "Obsidian Cyan",
        "finish": "Matte Carbon-Fiber & Aerospace Grade 5 Titanium",
        "tagline": "Zero-Latency Spatial Audio Architecture",
        "description": "Engineered for competitive audio environments and low-latency acoustic spatialization. Features dual graphene-coated diaphragms and electric-cyan laser luminescent rings.",
        "soundProfile": "Hyper-Dynamic Soundstage with 0.8ms wireless synchronization.",
        "accentColor": "#00f2fe",
        "glowRgb": [0, 242, 254],
        "specs": {
            "latency": "0.8 ms",
            "playtime": "64 hrs",
            "frequency": "5 Hz - 48 kHz",
            "anc": "-45 dB",
            "driverSize": "50mm",
            "weightGrams": 280
        }
    },
    "aurora-emerald": {
        "id": "aurora-emerald",
        "name": "Aurora Emerald",
        "finish": "Brushed Arctic Magnesium & Radioactive Mint Luminescence",
        "tagline": "Extreme Precision Studio Reference Monitor",
        "description": "Uncompromising linear frequency curve engineered for mixing engineers and studio mastering. Provides surgical acoustic isolation and ultra-wide soundstage separation.",
        "soundProfile": "Flat Reference Acoustic curve with surgical transient response.",
        "accentColor": "#00ffa3",
        "glowRgb": [0, 255, 163],
        "specs": {
            "latency": "0.9 ms",
            "playtime": "62 hrs",
            "frequency": "5 Hz - 52 kHz",
            "anc": "-48 dB",
            "driverSize": "50mm",
            "weightGrams": 282
        }
    }
}

class ShowcaseHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/variants":
            self.send_json_response(200, {
                "status": "success",
                "count": len(PRODUCT_VARIANTS),
                "data": PRODUCT_VARIANTS
            })
            return
        elif self.path.startswith("/api/variants/"):
            variant_id = self.path.split("/")[-1]
            if variant_id in PRODUCT_VARIANTS:
                self.send_json_response(200, {
                    "status": "success",
                    "data": PRODUCT_VARIANTS[variant_id]
                })
            else:
                self.send_json_response(404, {"status": "error", "message": "Not found"})
            return
        elif self.path == "/api/telemetry":
            self.send_json_response(200, {
                "status": "success",
                "data": {
                    "timestamp": int(time.time()),
                    "gridActiveRate": 99.8,
                    "rfSpatialLatencyMs": 0.8,
                    "ancAttenuationDb": -46.2,
                    "batteryHealthPercent": 100,
                    "audioSamplingRateKhz": 48.0
                }
            })
            return
        elif self.path == "/api/health":
            self.send_json_response(200, {"status": "healthy", "service": "voltx-showcase-api"})
            return
        return super().do_GET()

    def send_json_response(self, status_code, data):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

def run_server():
    mimetypes.add_type("image/svg+xml", ".svg")
    mimetypes.add_type("text/javascript", ".js")
    mimetypes.add_type("application/typescript", ".ts")
    mimetypes.add_type("text/css", ".css")

    server_address = (HOST, PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, ShowcaseHandler)
    print("=" * 65)
    print("⚡ VOLTX AETHER-01 PRO // SHOWCASE & TELEMETRY API SERVER")
    print(f"📡 Serving on: http://localhost:{PORT}")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()

if __name__ == "__main__":
    run_server()