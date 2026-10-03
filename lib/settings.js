"use client";

// Datos de contacto, redes y cifras del sitio, administrables desde
// /administracion (pestaña "Contacto") y guardados en el servidor (ver
// lib/contentStore.js), con los valores actuales del sitio como default
// hasta que se edite algo.
import { useMemo } from "react";
import { getContent, saveContent, useContent } from "./contentStore";

export const DEFAULT_SETTINGS = {
  phoneDisplay: "+56 9 8405 8116",
  phoneDigits: "56984058116", // solo dígitos, para tel:/wa.me
  email: "contacto@gsmotos.cl",
  address: "Av. Presidente Riesco 6721, Las Condes, Santiago, Chile",
  instagramUser: "tallergsmotos",
  statYears: "15+",
  statBmwYears: "21+",
  statPros: "10+",
  statMotos: "1000+",
  ratingScore: "4.7",
  ratingCount: "161",
  // Ficha real de "GS Motos" en Google Maps (confirmada: coincide con el
  // negocio real, Riesco 6721, Las Condes). El puntaje y la cantidad de
  // reseñas de arriba todavía son de ejemplo — Google no deja leer esos
  // dos números sin abrir el link (los carga con JavaScript), hay que
  // completarlos a mano cuando el cliente los pase.
  reviewsUrl: "https://maps.app.goo.gl/uZGfNq4BT4C3HZkH8",
};

function withDefaults(saved) {
  return saved && typeof saved === "object" ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
}

export function readSettings() {
  return withDefaults(getContent("settings"));
}

// Devuelve una promesa con true/false (ver lib/contentStore.js).
export function writeSettings(partial) {
  return saveContent("settings", { ...readSettings(), ...partial });
}

export function resetSettings() {
  return saveContent("settings", null);
}

export function useSettings() {
  const saved = useContent("settings");
  return useMemo(() => withDefaults(saved), [saved]);
}

export function mapsUrl(address) {
  return `https://maps.google.com/?q=${encodeURIComponent(address || DEFAULT_SETTINGS.address)}`;
}

// Link de reseñas: el real (reviewsUrl) si ya se cargó, si no un fallback
// razonable con la dirección en Maps.
export function reviewsUrlFor(s) {
  return s.reviewsUrl || mapsUrl(s.address);
}

// QR real (no decorativo) que apunta a reviewsUrlFor — servicio público de
// generación de QR por URL, sin agregar ninguna librería nueva al proyecto.
export function qrCodeUrl(data, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export function whatsappUrl(phoneDigits, message) {
  const base = `https://wa.me/${phoneDigits || DEFAULT_SETTINGS.phoneDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function instagramUrl(user) {
  return `https://www.instagram.com/${user || DEFAULT_SETTINGS.instagramUser}/`;
}
