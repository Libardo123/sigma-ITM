/**
 * setup.js — Configuración global para pruebas de Vitest.
 * Importa @testing-library/jest-dom para tener matchers como toBeInTheDocument().
 */
import "@testing-library/jest-dom";
import React from "react";

// Hace React disponible globalmente durante los tests para JSX
globalThis.React = React;

