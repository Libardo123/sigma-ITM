/**
 * PanelAprobacion.test.jsx — SIGMA ITM
 * Pruebas unitarias:
 * - Bloque 15: visualización de documentos radicados o estado vacío.
 * - Bloque 21: bloqueo visual por corrección pendiente y discriminación RBAC por etapa.
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

let mockUsuario = { id: 2, username: "comite1", rol: "COMITE" };

// Mock de AuthContext dinámico
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: mockUsuario,
  }),
}));

// Mock del cliente API
vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from "../api/client";
import PanelAprobacion from "../pages/PanelAprobacion";

describe("PanelAprobacion — visualización y RBAC por etapa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsuario = { id: 2, username: "comite1", rol: "COMITE" };
  });

  it("renderiza la lista de documentos con enlaces de descarga cuando existen archivos (Bloque 15)", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: "proc-uuid-1",
          estudiante: 1,
          estudiante_nombre: "Juan Pérez",
          modalidad_nombre: "Trabajo de Grado",
          titulo_proyecto: "Sistema de Monitoreo IoT",
          estado: "POSTULACION",
          estado_display: "Postulación",
          transiciones_disponibles: ["REVISION_DOCUMENTAL"],
          requiere_correccion: false,
          documentos: [
            {
              id: 101,
              nombre: "Propuesta de Grado",
              archivo: "/media/documentos/2026/09/propuesta.pdf",
              subido_en: "2026-09-20T10:30:00Z",
            },
            {
              id: 102,
              nombre: "Certificado de Paz y Salvo",
              archivo: "https://itm.edu.co/docs/paz_salvo.pdf",
              subido_en: "2026-09-20T11:00:00Z",
            },
          ],
        },
      ],
    });

    render(<PanelAprobacion />);

    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Documentos del Estudiante/i)).toBeInTheDocument();
    expect(screen.getByText(/Propuesta de Grado/i)).toBeInTheDocument();
    expect(screen.getByText(/Certificado de Paz y Salvo/i)).toBeInTheDocument();

    const enlaces = screen.getAllByRole("link", { name: /descargar o ver/i });
    expect(enlaces).toHaveLength(2);
    expect(enlaces[0]).toHaveAttribute("target", "_blank");
    expect(enlaces[0]).toHaveAttribute("rel", "noopener noreferrer");
    expect(enlaces[0].getAttribute("href")).toContain("/media/documentos/2026/09/propuesta.pdf");
    expect(enlaces[1].getAttribute("href")).toBe("https://itm.edu.co/docs/paz_salvo.pdf");
  });

  it("muestra mensaje explícito de estado vacío cuando el estudiante no tiene documentos", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: "proc-uuid-2",
          estudiante: 2,
          estudiante_nombre: "Ana Gómez",
          modalidad_nombre: "Prácticas Profesionales",
          titulo_proyecto: "Práctica en Ruta N",
          estado: "POSTULACION",
          estado_display: "Postulación",
          transiciones_disponibles: ["REVISION_DOCUMENTAL"],
          requiere_correccion: false,
          documentos: [],
        },
      ],
    });

    render(<PanelAprobacion />);

    await waitFor(() => {
      expect(screen.getByText(/Ana Gómez/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/El estudiante aún no ha subido documentos/i)
    ).toBeInTheDocument();
  });

  it("oculta los botones de avanzar y muestra 'En espera de respuesta del estudiante' cuando requiere_correccion es true (Bloque 21)", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: "proc-corr-1",
          estudiante: 1,
          estudiante_nombre: "Carlos Gómez",
          modalidad_nombre: "Trabajo de Grado",
          titulo_proyecto: "Visión Artificial",
          estado: "POSTULACION",
          estado_display: "Postulación",
          transiciones_disponibles: [], // Bloque 17 backend retorna []
          requiere_correccion: true,
          observacion_correccion: "Falta el cronograma detallado de actividades.",
          documentos: [],
        },
      ],
    });

    render(<PanelAprobacion />);

    await waitFor(() => {
      expect(screen.getByText(/Carlos Gómez/i)).toBeInTheDocument();
    });

    // Validar que se muestre el aviso claro de espera
    expect(
      screen.getByText(/En espera de respuesta del estudiante/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Avance bloqueado/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Falta el cronograma detallado de actividades/i)
    ).toBeInTheDocument();

    // No debe mostrarse ningún botón para avanzar
    expect(
      screen.queryByRole("button", { name: /enviar a revisión/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /pedir corrección/i })
    ).not.toBeInTheDocument();
  });

  it("muestra modo solo lectura cuando el usuario autenticado no tiene potestad sobre la etapa (Bloque 21)", async () => {
    // Usuario Asesor mirando un proceso en etapa POSTULACION (que es exclusiva del Comité)
    mockUsuario = { id: 10, username: "asesor1", rol: "ASESOR" };

    api.get.mockResolvedValueOnce({
      data: [
        {
          id: "proc-comite-only",
          estudiante: 3,
          estudiante_nombre: "Laura Medina",
          modalidad_nombre: "Trabajo de Grado",
          titulo_proyecto: "Criptografía Post-Cuántica",
          estado: "POSTULACION",
          estado_display: "Postulación",
          transiciones_disponibles: ["REVISION_DOCUMENTAL"],
          requiere_correccion: false,
          documentos: [],
        },
      ],
    });

    render(<PanelAprobacion />);

    await waitFor(() => {
      expect(screen.getByText(/Laura Medina/i)).toBeInTheDocument();
    });

    // Se debe mostrar el mensaje de solo lectura indicando que corresponde al Comité
    expect(
      screen.getByText(/Modo solo lectura: La gestión de esta etapa corresponde al Comité de Trabajos de Grado/i)
    ).toBeInTheDocument();

    // Los botones de acción deben estar ocultos
    expect(
      screen.queryByRole("button", { name: /enviar a revisión/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /pedir corrección/i })
    ).not.toBeInTheDocument();
  });

  it("permite gestionar la etapa EN_PROCESO al Asesor asignado (Bloque 21)", async () => {
    // Usuario Asesor con id 10
    mockUsuario = { id: 10, username: "asesor1", rol: "ASESOR" };

    api.get.mockResolvedValueOnce({
      data: [
        {
          id: "proc-asesor-ok",
          estudiante: 4,
          estudiante_nombre: "Diana Ruiz",
          modalidad_nombre: "Trabajo de Grado",
          titulo_proyecto: "Robótica Quirúrgica",
          estado: "EN_PROCESO",
          estado_display: "En Proceso",
          asesor: 10, // Asignado a este asesor
          transiciones_disponibles: ["SUSTENTACION"],
          requiere_correccion: false,
          documentos: [],
        },
      ],
    });

    render(<PanelAprobacion />);

    await waitFor(() => {
      expect(screen.getByText(/Diana Ruiz/i)).toBeInTheDocument();
    });

    // El asesor asignado SÍ debe ver los botones de acción
    expect(
      screen.getByRole("button", { name: /pedir corrección/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sustentación/i })
    ).toBeInTheDocument();
  });

  it("permite navegar a la pestaña de 'Historial y Trazabilidad de Proyectos' y consultar proyectos", async () => {
    mockUsuario = { id: 2, username: "comite1", rol: "COMITE" };

    api.get.mockResolvedValueOnce({
      data: [
        {
          id: "proc-hist-1",
          estudiante: 1,
          estudiante_nombre: "Mateo Carvajal",
          modalidad_nombre: "Semillero de Investigación",
          titulo_proyecto: "Algoritmos Genéticos en Robótica",
          estado: "EN_PROCESO",
          estado_display: "En Proceso",
          asesor_nombre: "Prof. Alberto Restrepo",
          transiciones_disponibles: [],
          requiere_correccion: false,
          documentos: [],
        },
      ],
    });

    render(<PanelAprobacion />);

    await waitFor(() => {
      expect(screen.getByText(/Mateo Carvajal/i)).toBeInTheDocument();
    });

    // Pestañas visibles
    const tabHistorial = screen.getByRole("button", {
      name: /historial y trazabilidad de proyectos/i,
    });
    expect(tabHistorial).toBeInTheDocument();

    // Click en la pestaña de Historial
    fireEvent.click(tabHistorial);

    // Comprobar que se muestra el encabezado del historial
    expect(
      screen.getByText(/Historial y Trazabilidad Integral de Proyectos/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/buscar por estudiante, proyecto, asesor/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Algoritmos Genéticos en Robótica/i)).toBeInTheDocument();
  });
});

