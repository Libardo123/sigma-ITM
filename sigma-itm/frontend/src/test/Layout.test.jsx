/**
 * Layout.test.jsx — SIGMA ITM
 * Pruebas del bloque 24: encabezado contextual dinámico según la ruta y el rol de usuario.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

let mockUsuario = {
  id: 1,
  username: "estudiante1",
  first_name: "Jorge",
  last_name: "Bernal",
  rol: "ESTUDIANTE",
  programa_academico: "Tecnología en Desarrollo de Software",
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: mockUsuario,
    logout: vi.fn(),
  }),
}));

import Layout from "../components/Layout";

describe("Layout — Encabezado de Contexto Dinámico (Bloque 24)", () => {
  it("muestra 'Mi Proceso de Opción de Grado' y el nombre del estudiante en /app para estudiante", () => {
    mockUsuario = {
      id: 1,
      username: "estudiante1",
      first_name: "Jorge",
      last_name: "Bernal",
      rol: "ESTUDIANTE",
      programa_academico: "Tecnología en Desarrollo de Software",
    };

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Layout>
          <div>Contenido de prueba</div>
        </Layout>
      </MemoryRouter>
    );

    // Encabezado en desktop y mobile
    const titulos = screen.getAllByText("Mi Proceso de Opción de Grado");
    expect(titulos.length).toBeGreaterThanOrEqual(1);

    const subtitulos = screen.getAllByText(/Jorge Bernal • Tecnología en Desarrollo de Software/i);
    expect(subtitulos.length).toBeGreaterThanOrEqual(1);
  });

  it("muestra 'Panel de Aprobación de Procesos' en /app/aprobaciones", () => {
    mockUsuario = {
      id: 2,
      username: "comite1",
      first_name: "Jorge Iván",
      last_name: "Bedoya",
      rol: "COMITE",
    };

    render(
      <MemoryRouter initialEntries={["/app/aprobaciones"]}>
        <Layout>
          <div>Contenido de prueba</div>
        </Layout>
      </MemoryRouter>
    );

    const titulos = screen.getAllByText("Panel de Aprobación de Procesos");
    expect(titulos.length).toBeGreaterThanOrEqual(1);
    const subtitulos = screen.getAllByText("Revisión, seguimiento y control de etapas");
    expect(subtitulos.length).toBeGreaterThanOrEqual(1);
  });

  it("muestra 'Estadísticas Generales' en /app/dashboard", () => {
    mockUsuario = {
      id: 2,
      username: "comite1",
      rol: "COMITE",
    };

    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <Layout>
          <div>Contenido de prueba</div>
        </Layout>
      </MemoryRouter>
    );

    const titulos = screen.getAllByText("Estadísticas Generales");
    expect(titulos.length).toBeGreaterThanOrEqual(1);
    const subtitulos = screen.getAllByText("Métricas consolidadas y avance institucional");
    expect(subtitulos.length).toBeGreaterThanOrEqual(1);
  });
});
